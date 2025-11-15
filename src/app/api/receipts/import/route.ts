// src/app/api/receipts/import/route.ts
import { NextResponse } from "next/server"
import { persistReceipt } from "@/server/receipts/persist"
import { getUserIdFromSession } from "@/app/api/_auth-helpers"
import { parseOcrToReceipt } from "@/lib/parseOcrToReceipt"
import type { PersistInput } from "@/server/receipts/persist"
import type { ReceiptItem } from "@/components/receipt/types"

type ImportFile = {
  url: string
  mimeType?: string
  width?: number
  height?: number
  sha256?: string
  page?: number
}

// ScanContent から渡ってくるサマリ用
type ExtractedSummary = {
  storeName?: string | null
  purchaseDate?: string | null
  total?: number | null
}

// parseOcrToReceipt の戻り値に items 情報を足して扱うための緩い型
type NormalizedReceipt = ReturnType<typeof parseOcrToReceipt> & {
  merchant?: { name?: string | null } | null
  purchasedAt?: string | null
  totals: {
    grandTotal?: number | null
    [key: string]: unknown
  }
  items?: ReceiptItem[]
}

type ImportBody = {
  rawOcrText: string
  files?: ImportFile[]
  parser?: string
  parseVersion?: string
  ocrEngine?: PersistInput["ocrEngine"]
  taxBreakdown?: Record<string, unknown> | null
  extracted?: ExtractedSummary
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  try {
    return JSON.stringify(err)
  } catch {
    return "unknown error"
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as ImportBody
    const {
      rawOcrText,
      files,
      parser,
      parseVersion,
      ocrEngine = "OTHER",
      taxBreakdown = null,
      extracted,
    } = body ?? {}

    if (typeof rawOcrText !== "string" || rawOcrText.trim() === "") {
      return NextResponse.json({ error: "rawOcrText is required" }, { status: 400 })
    }

    // 1. まずは既存ロジックで正規化
    let normalized = parseOcrToReceipt(rawOcrText) as NormalizedReceipt

    // 2. extracted があれば、足りないところだけ上書きフォールバック
    if (extracted) {
      // 店名
      const currentName = normalized.merchant?.name
      const shouldOverrideName = !currentName || currentName === "不明な店舗"

      if (shouldOverrideName && extracted.storeName) {
        normalized = {
          ...normalized,
          merchant: {
            ...(normalized.merchant ?? {}),
            name: extracted.storeName,
          },
        }
      }

      // 購入日
      if (!normalized.purchasedAt && extracted.purchaseDate) {
        normalized = {
          ...normalized,
          purchasedAt: extracted.purchaseDate,
        }
      }

      // 合計金額
      const currentTotal = normalized.totals.grandTotal
      const shouldOverrideTotal = !currentTotal || Number(currentTotal) === 0

      if (shouldOverrideTotal && typeof extracted.total === "number") {
        normalized = {
          ...normalized,
          totals: {
            ...normalized.totals,
            grandTotal: extracted.total,
          },
        }
      }
    }

    // 3. 品目情報(items) がダミーっぽければ、rawOcrText から再パースして上書き
    const looksDummyItems = isDummyItems(normalized.items)
    if (looksDummyItems) {
      const fallbackTotal =
        typeof normalized.totals.grandTotal === "number"
          ? normalized.totals.grandTotal
          : typeof extracted?.total === "number"
            ? (extracted.total ?? undefined)
            : undefined

      const parsedItems = extractItemsFromText(rawOcrText, fallbackTotal)

      if (parsedItems.length > 0) {
        normalized = {
          ...normalized,
          items: parsedItems,
        }
      }
    }

    // デバッグログ（何が supabase/DB に保存されるか確認用）
    console.log("[IMPORT] normalized receipt:", JSON.stringify(normalized, null, 2))

    const saved = await persistReceipt({
      userId,
      normalized,
      rawOcrText,
      files,
      parser,
      parseVersion,
      ocrEngine,
      taxBreakdown,
      status: "DRAFT", // OCR直後はドラフト
    })

    console.log("[IMPORT] saved receipt summary:", {
      id: saved.id,
      userId: saved.userId,
      status: saved.status,
      storeName: saved.storeName,
      purchaseDate: saved.purchaseDate,
      total: saved.total,
    })

    return NextResponse.json({ ok: true, receipt: saved }, { status: 201 })
  } catch (err: unknown) {
    console.error("[IMPORT] error:", err)
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}

//
// ===== ここから下は品目抽出用ヘルパー =====
//

// 全角→半角・通貨や空白の正規化（OCR用の簡易版）
function normalizeText(s: string): string {
  const z2h = (str: string) =>
    str.replace(/[０-９．－，￥]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
  return z2h(s).replace(/￥/g, "¥").replace(/\s+/g, " ").trim()
}

// 金額文字列を数値へ（¥/カンマ/全角対応）
function parseAmount(raw?: string | null): number | undefined {
  if (!raw) return
  const s = normalizeText(raw).replace(/[^\d.-]/g, "")
  if (!s) return
  const n = Number(s.replace(/,/g, ""))
  return Number.isFinite(n) ? Math.round(n) : undefined
}

// ダミー items かどうか判定
function isDummyItems(items: ReceiptItem[] | undefined): boolean {
  if (!items || items.length === 0) return true
  if (items.length > 1) return false
  const item = items[0]
  const name = item.name ?? ""
  const total = item.total ?? 0
  return name === "不明な品目" || total === 0
}

// 価格行っぽいか（例: "*200", "¥178", " 330", "¥1,441"）
function isPriceLine(line: string): boolean {
  const s = line.trim()
  return /^(\*|¥|￥)?\s*[０-９0-9]{1,3}(?:[,\s][０-９0-9]{3})*$/.test(s)
}

// "@165x 2" のような表記から単価と数量を取る
function parseUnitAndQty(line: string): { unitPrice?: number; qty?: number } {
  const m = line.match(/@?\s*([０-９0-9]+)\s*[x×]\s*([０-９0-9]+)/)
  if (!m) return {}
  const unitPrice = parseAmount(m[1])
  const qty = parseAmount(m[2])
  return { unitPrice, qty }
}

// 品名候補にスコアを付ける
function scoreItemName(line: string): number {
  const s = line.trim()
  let score = 0

  const len = s.length
  if (len < 2 || len > 25) score -= 10

  // 日本語（漢字・カタカナ・ひらがな）が含まれていれば強く加点
  if (/[一-龠々ァ-ヶーぁ-ん]/.test(s)) score += 40

  // 英字だけの場合は少しだけ加点（チェーン名等を想定）
  if (/[A-Za-z]/.test(s)) score += 10

  // 店名・会社名っぽいものは減点（品目ではない可能性が高い）
  if (/(TEL|電話|株式会社|店$)/.test(s)) score -= 30

  // 完全に英字だけっぽい行は減点（OCR ノイズを想定）
  const dense = s.replace(/\s/g, "")
  const asciiCount = dense.match(/[A-Za-z]/g)?.length ?? 0
  const nonAsciiCount = dense.length - asciiCount
  if (asciiCount > 0 && nonAsciiCount === 0) {
    score -= 20
  }

  return score
}

// 品名候補行かどうか（数字だらけでない、日本語or英字を含む、合計系ではない）
function isItemNameCandidate(line: string): boolean {
  const s = line.trim()
  if (!s) return false

  // 明細に紛れた「小計」「合計」「税」などは除外
  if (/(小計|合計|総合計|税|円|JPY|領収書|お買上明細)/.test(s)) return false
  // 価格行も除外
  if (isPriceLine(s)) return false

  // 何かしらの文字（漢字・カナ・ひらがな・英字）が含まれていなければ NG
  if (!/[A-Za-z一-龠々ァ-ヶーぁ-ん]/.test(s)) return false

  // スコアがプラスのものだけ「品名候補」とみなす
  return scoreItemName(s) > 0
}

function extractItemsFromText(rawText: string, grandTotal?: number): ReceiptItem[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((s) => normalizeText(s))
    .filter(Boolean)

  // 1. 明細ゾーンの範囲を決める
  let startIdx = 0
  let endIdx = lines.length

  // "領収書" や "お買上明細" の次行からスタート
  for (let i = 0; i < lines.length; i++) {
    if (/領収書|お買上明細/.test(lines[i])) {
      startIdx = i + 1
      break
    }
  }

  // "小計" や "合計" が出てきたところで終わり
  for (let i = startIdx; i < lines.length; i++) {
    if (/小計|合計|総合計/.test(lines[i])) {
      endIdx = i
      break
    }
  }

  const zone = lines.slice(startIdx, endIdx)

  const items: ReceiptItem[] = []

  for (let i = 0; i < zone.length; i++) {
    const line = zone[i]

    // 価格行でなければスキップ
    if (!isPriceLine(line)) continue

    const price = parseAmount(line)
    if (price == null) continue

    // 直前の数行から「品名候補」を集める（最大4行くらいまで遡る）
    const nameCandidates: string[] = []
    const unitQty: { unitPrice?: number; qty?: number } = {}

    for (let back = 1; back <= 4; back++) {
      const idx = i - back
      if (idx < 0) break
      const prev = zone[idx]

      // 数量・単価行（@165x 2 など）があれば記録
      const uq = parseUnitAndQty(prev)
      if (uq.unitPrice || uq.qty) {
        if (!unitQty.unitPrice && uq.unitPrice) unitQty.unitPrice = uq.unitPrice
        if (!unitQty.qty && uq.qty) unitQty.qty = uq.qty
        continue
      }

      // 品名候補なら候補リストに追加
      if (isItemNameCandidate(prev)) {
        nameCandidates.push(prev)
      }

      // 小計・合計っぽいものにぶつかったらそこから先は見ない
      if (/(本体合計|小計|合計|総合計)/.test(prev)) {
        break
      }
    }

    if (!nameCandidates.length) {
      // 品名候補が見つからない場合はスキップ（フォールバックは後でまとめて考える）
      continue
    }

    // スコアが最も高い品名を採用
    const bestName = nameCandidates.sort((a, b) => scoreItemName(b) - scoreItemName(a))[0]

    const qty = unitQty.qty ?? 1
    const unitPrice = unitQty.unitPrice ?? Math.round(price / qty)

    items.push({
      name: bestName || "不明な品目",
      qty,
      unitPrice,
      total: price,
      taxRate: undefined,
    })
  }

  // それでも 1 件も取れなかった場合のフォールバック
  if (!items.length && grandTotal != null && grandTotal > 0) {
    const fallbackName = zone.find((l) => isItemNameCandidate(l)) || "不明な品目"

    items.push({
      name: fallbackName,
      qty: 1,
      unitPrice: grandTotal,
      total: grandTotal,
      taxRate: undefined,
    })
  }

  return items
}
