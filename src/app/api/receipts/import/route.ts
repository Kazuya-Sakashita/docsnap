// src/app/api/receipts/import/route.ts
import { NextResponse } from "next/server"
import { persistReceipt } from "@/server/receipts/persist"
import { getUserIdFromSession } from "@/app/api/_auth-helpers"
import { parseOcrToReceipt } from "@/lib/parseOcrToReceipt"
import type { PersistInput } from "@/server/receipts/persist"

// ---- ここからこのファイル専用の型 ----

type ParsedItem = {
  name: string
  qty: number
  unitPrice: number
  total: number
  taxRate?: number | undefined
}

type ImportFile = {
  url: string
  mimeType?: string
  width?: number
  height?: number
  sha256?: string
  page?: number
}

// OCR API (/api/ocr) から直接渡される単一画像想定
type ImportImage = {
  url: string
  mimeType?: string
  width?: number
  height?: number
  sha256?: string
  page?: number
}

type ExtractedSummary = {
  storeName?: string | null
  purchaseDate?: string | null
  total?: number | null
}

type NormalizedReceipt = ReturnType<typeof parseOcrToReceipt> & {
  merchant?: { name?: string | null } | null
  purchasedAt?: string | null
  totals: {
    grandTotal?: number | null
    [key: string]: unknown
  }
  items?: ParsedItem[]
}

type ImportBody = {
  rawOcrText: string
  files?: ImportFile[]
  image?: ImportImage | null
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
      image,
      parser,
      parseVersion,
      ocrEngine = "OTHER",
      taxBreakdown = null,
      extracted,
    } = body ?? {}

    if (typeof rawOcrText !== "string" || rawOcrText.trim() === "") {
      return NextResponse.json({ error: "rawOcrText is required" }, { status: 400 })
    }

    // ========== 画像ファイル情報を正規化 ==========
    let normalizedFiles: ImportFile[] | undefined

    if (files && files.length > 0) {
      normalizedFiles = files
    } else if (image && image.url) {
      normalizedFiles = [
        {
          url: image.url,
          mimeType: image.mimeType ?? "image/png",
          width: image.width,
          height: image.height,
          sha256: image.sha256,
          page: image.page ?? 1,
        },
      ]
    } else {
      normalizedFiles = undefined
    }

    // 1. まずは既存ロジックで正規化
    let normalized = parseOcrToReceipt(rawOcrText) as NormalizedReceipt

    // 2. extracted があれば、足りないところだけ上書きフォールバック
    if (extracted) {
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

      if (!normalized.purchasedAt && extracted.purchaseDate) {
        normalized = {
          ...normalized,
          purchasedAt: extracted.purchaseDate,
        }
      }

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

    // 3. 常に rawOcrText から品目を再抽出してみる
    const fallbackTotal =
      typeof normalized.totals.grandTotal === "number"
        ? normalized.totals.grandTotal
        : typeof extracted?.total === "number"
          ? extracted.total ?? undefined
          : undefined

    const parsedItems = extractItemsFromText(rawOcrText, fallbackTotal)

    if (parsedItems.length > 0) {
      const currentCount = normalized.items?.length ?? 0

      // もともと items が無い / 1件しかない / fallback の方が明細行数が多い
      if (currentCount === 0 || parsedItems.length >= currentCount) {
        normalized = {
          ...normalized,
          items: parsedItems,
        }
      }
    }

    console.log("[IMPORT] normalized receipt:", JSON.stringify(normalized, null, 2))
    if (normalizedFiles) {
      console.log("[IMPORT] files to persist:", JSON.stringify(normalizedFiles, null, 2))
    } else {
      console.log("[IMPORT] files to persist: none")
    }

    const saved = await persistReceipt({
      userId,
      normalized,
      rawOcrText,
      files: normalizedFiles,
      parser,
      parseVersion,
      ocrEngine,
      taxBreakdown,
      status: "DRAFT",
      imageUrl: normalizedFiles?.[0]?.url ?? null, // Receipt.imageUrl 用
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

function normalizeText(s: string): string {
  const z2h = (str: string) =>
    str.replace(/[０-９．－，￥]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
  return z2h(s).replace(/￥/g, "¥").replace(/\s+/g, " ").trim()
}

function parseAmount(raw?: string | null): number | undefined {
  if (!raw) return
  const s = normalizeText(raw).replace(/[^\d.-]/g, "")
  if (!s) return
  const n = Number(s.replace(/,/g, ""))
  return Number.isFinite(n) ? Math.round(n) : undefined
}

function isPriceLine(line: string): boolean {
  const s = line.trim()
  return /^(\*|¥|￥)?\s*[０-９0-9]{1,3}(?:[,\s][０-９0-9]{3})*$/.test(s)
}

function parseUnitAndQty(line: string): { unitPrice?: number; qty?: number } {
  const m = line.match(/@?\s*([０-９0-9]+)\s*[x×]\s*([０-９0-9]+)/)
  if (!m) return {}
  const unitPrice = parseAmount(m[1])
  const qty = parseAmount(m[2])
  return { unitPrice, qty }
}

function scoreItemName(line: string): number {
  const s = line.trim()
  let score = 0

  const len = s.length
  if (len < 2 || len > 25) score -= 10
  if (/[一-龠々ァ-ヶーぁ-ん]/.test(s)) score += 40
  if (/[A-Za-z]/.test(s)) score += 10
  if (/(TEL|電話|株式会社|店$)/.test(s)) score -= 30

  const dense = s.replace(/\s/g, "")
  const asciiCount = dense.match(/[A-Za-z]/g)?.length ?? 0
  const nonAsciiCount = dense.length - asciiCount
  if (asciiCount > 0 && nonAsciiCount === 0) {
    score -= 20
  }

  return score
}

function isItemNameCandidate(line: string): boolean {
  const s = line.trim()
  if (!s) return false

  // 金額・小計・合計などは除外
  if (/(小計|合計|総合計|税|円|JPY|領収書|お買上明細)/.test(s)) return false
  if (isPriceLine(s)) return false

  // ★ 店舗名っぽい行は除外（ここを追加）
  //   - 行末が「店」
  //   - 会社・支店など
  if (/(株式会社|有限会社|支店|本店|支社|営業所|店$)/.test(s)) return false

  // 文字種チェック
  if (!/[A-Za-z一-龠々ァ-ヶーぁ-ん]/.test(s)) return false

  return scoreItemName(s) > 0
}


function extractItemsFromText(rawText: string, grandTotal?: number): ParsedItem[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((s) => normalizeText(s))
    .filter(Boolean)

  let startIdx = 0
  let endIdx = lines.length

  // 「領収書」「お買上明細」などの次行から明細ゾーンを開始
  for (let i = 0; i < lines.length; i++) {
    if (/領収書|お買上明細/.test(lines[i])) {
      startIdx = i + 1
      break
    }
  }

  // 「小計」「合計」などが出てきたところで明細ゾーンを終了
  for (let i = startIdx; i < lines.length; i++) {
    if (/小計|合計|総合計/.test(lines[i])) {
      endIdx = i
      break
    }
  }

  const zone = lines.slice(startIdx, endIdx)
  const items: ParsedItem[] = []

  // ★ どの行インデックスの品名をすでに使ったかを記録
  const usedNameLineIndexes = new Set<number>()

  for (let i = 0; i < zone.length; i++) {
    const line = zone[i]
    if (!isPriceLine(line)) continue

    const price = parseAmount(line)
    if (price == null) continue

    // 直前数行から品名候補と @165x 2 形式を探す
    const nameCandidates: Array<{ line: string; index: number }> = []
    const unitQty: { unitPrice?: number; qty?: number } = {}

    for (let back = 1; back <= 4; back++) {
      const idx = i - back
      if (idx < 0) break
      const prev = zone[idx]

      const uq = parseUnitAndQty(prev)
      if (uq.unitPrice || uq.qty) {
        if (!unitQty.unitPrice && uq.unitPrice) unitQty.unitPrice = uq.unitPrice
        if (!unitQty.qty && uq.qty) unitQty.qty = uq.qty
        continue
      }

      if (isItemNameCandidate(prev)) {
        // どの行から来た品名かも覚えておく
        nameCandidates.push({ line: prev, index: idx })
      }

      if (/(本体合計|小計|合計|総合計)/.test(prev)) {
        break
      }
    }

    if (!nameCandidates.length) continue

    // ★ 後ろ（上の行）から見て「まだ使っていない品名」を選ぶ
    let chosen: { line: string; index: number } | undefined
    for (let ci = nameCandidates.length - 1; ci >= 0; ci--) {
      const cand = nameCandidates[ci]
      if (!usedNameLineIndexes.has(cand.index)) {
        chosen = cand
        break
      }
    }

    // 全部使われていたら一番近い候補を再利用
    if (!chosen) {
      chosen = nameCandidates[0]
    }

    usedNameLineIndexes.add(chosen.index)
    const bestName = chosen.line

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

  // 1件も取れなかった場合のみ、合計金額 1 行だけのフォールバック
  if (!items.length && grandTotal != null && grandTotal > 0) {
    const fallbackName =  [...zone].reverse().find((l) => isItemNameCandidate(l)) || "不明な品目"

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
