// src/app/api/ocr/route.ts
import { NextResponse } from "next/server"
import sharp from "sharp"
import { ImageAnnotatorClient, protos as visionProtos } from "@google-cloud/vision"
import { createSupabaseServerClientReadonly } from "@/lib/supabase/server"

export const runtime = "nodejs"

// ---- 設定 ----
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/jpg"])
const DEFAULT_MODE = "text" as const // "text" | "document"
const RECEIPT_BUCKET = "receipts" // Supabase Storage のバケット名（作成しておく）

// ---- 型エイリアス ----
type AnnotateResponse = visionProtos.google.cloud.vision.v1.IAnnotateImageResponse
type Page = visionProtos.google.cloud.vision.v1.IPage
type Block = visionProtos.google.cloud.vision.v1.IBlock
type Vertex = visionProtos.google.cloud.vision.v1.IVertex

// ---- ヘルパー ----
function bad(status: number, message: string, detail?: unknown) {
  return NextResponse.json(
    detail ? { error: message, detail } : { error: message },
    { status },
  )
}

/** ローカル(JSONキー) or Vercel(環境変数) 両対応クライアント */
function createVisionClient(): ImageAnnotatorClient {
  // 1) ローカルで GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json を使う場合
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_PROJECT_ID,
    })
  }

  // 2) Vercel/環境変数3分割方式（推奨）
  const projectId = process.env.GOOGLE_PROJECT_ID
  const client_email = process.env.GOOGLE_CLIENT_EMAIL
  let private_key = process.env.GOOGLE_PRIVATE_KEY
  if (!projectId || !client_email || !private_key) {
    throw new Error("Google Cloud credentials are not set")
  }
  private_key = private_key.replace(/\\n/g, "\n")

  return new ImageAnnotatorClient({
    projectId,
    credentials: { client_email, private_key },
  })
}

/** Visionの階層から平均信頼度(0–100)をざっくり推定 */
function estimateConfidence(result: AnnotateResponse): number {
  const pages = (result.fullTextAnnotation?.pages ?? []) as Page[]
  const arr: number[] = []
  for (const p of pages) {
    for (const b of (p.blocks ?? []) as Block[]) {
      for (const pg of b.paragraphs ?? []) {
        for (const w of pg.words ?? []) {
          if (typeof w.confidence === "number") arr.push(w.confidence)
        }
      }
    }
  }
  if (!arr.length) return 0
  const avg = arr.reduce((s, v) => s + v, 0) / arr.length
  return Math.round(avg * 1000) / 10 // 例: 92.3
}

// ---- 抽出ロジック用ヘルパー ----

// 全角→半角・通貨や空白の正規化
function normalize(s: string) {
  const z2h = (str: string) =>
    str.replace(/[０-９．－，￥]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
  return z2h(s).replace(/￥/g, "¥").replace(/\s+/g, " ").trim()
}

// 金額文字列を数値へ（¥/カンマ/全角対応）
function parseAmount(raw?: string | null): number | undefined {
  if (!raw) return
  const s = normalize(raw).replace(/[^\d.-]/g, "")
  if (!s) return
  const n = Number(s.replace(/,/g, ""))
  return Number.isFinite(n) ? Math.round(n) : undefined
}

// 1行からすべての数値候補を抜き出す
function findNumericAmounts(line: string): number[] {
  return [...line.matchAll(/([¥￥]?\s*[０-９0-9]{1,3}(?:[,\s][０-９0-9]{3})*|[０-９0-9]+)/g)]
    .map((m) => parseAmount(m[1]))
    .filter((n): n is number => n != null && n > 0)
}

// 指定キーワード直後（同一行 or 次行）の金額推定（10円未満は無視）
function findAmountAfterKeyword(lines: string[], keywords: RegExp[]): number | undefined {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (keywords.some((r) => r.test(line))) {
      const m1 = line.match(
        /([¥￥]?\s*[０-９0-9]{1,3}(?:[,\s][０-９0-9]{3})*|[０-９0-9]+)\s*(円|JPY)?/,
      )
      const a1 = parseAmount(m1?.[1])
      if (a1 != null && a1 >= 10) return a1

      const next = lines[i + 1]
      if (next) {
        const m2 = next.match(
          /([¥￥]?\s*[０-９0-9]{1,3}(?:[,\s][０-９0-9]{3})*|[０-９0-9]+)\s*(円|JPY)?/,
        )
        const a2 = parseAmount(m2?.[1])
        if (a2 != null && a2 >= 10) return a2
      }
    }
  }
  return undefined
}

// ==== 店名スコアリング関連ヘルパー ====

const STORE_STOP_WORDS =
  /(領収書|レシート|電話|TEL|住所|〒|伝票番号|レジ|#\d+|事業者登録番号|登録番号)/

// 住所行っぽい（都道府県・市区町村など）
function isAddressLine(line: string): boolean {
  return /[都道府県市区町村郡区町村丁目番地]/.test(line) || /〒\s*\d{3}-\d{4}/.test(line)
}

// 行の「店名っぽさ」をスコアリング
function scoreStoreLikeLine(line: string): number {
  let score = 0
  const trimmed = line.trim()
  const len = trimmed.length

  if (len < 2 || len > 30) score -= 20

  // NGワードを含んでいたら即 0
  if (STORE_STOP_WORDS.test(trimmed)) return 0
  if (isAddressLine(trimmed)) return 0

  // 日本語（漢字・カタカナ）が含まれていれば店名候補
  if (/[一-龠々ァ-ヶー]/.test(trimmed)) score += 40

  // 「○○店」「支店」「本店」など
  if (/(店|支店|本店)$/.test(trimmed)) score += 30

  // アルファベットを含む（英語チェーン名など）
  if (/[A-Za-z]/.test(trimmed)) score += 20

  // 数字が多いと減点（電話・住所・伝票番号など）
  const dense = trimmed.replace(/\s/g, "")
  const digitRatio = (dense.match(/\d/g)?.length ?? 0) / (dense.length || 1)
  if (digitRatio > 0.3) score -= 20

  return score
}

// 店名抽出：ブランド名ハードコードではなく「店名っぽさスコア」で決める
function extractStoreName(lines: string[], fullText: string): string {
  const headerLines: string[] = []
  for (const line of lines) {
    if (STORE_STOP_WORDS.test(line)) break
    headerLines.push(line)
    if (headerLines.length >= 12) break
  }

  const scored = headerLines
    .map((line, idx) => ({
      line,
      idx,
      score: scoreStoreLikeLine(line),
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    const fallback =
      headerLines.find(
        (l) => !STORE_STOP_WORDS.test(l) && !isAddressLine(l) && /[^\d\W]/u.test(l),
      ) ||
      lines[0] ||
      ""
    return fallback
  }

  const best = scored[0]
  let name = best.line

  // 直前の行がブランド名っぽいならくっつける
  if (best.idx > 0) {
    const prev = headerLines[best.idx - 1]
    if (
      prev &&
      !STORE_STOP_WORDS.test(prev) &&
      !isAddressLine(prev) &&
      prev.length <= 20 &&
      /[A-Za-z一-龠々ァ-ヶー]/.test(prev)
    ) {
      name = `${prev} ${name}`.trim()
    }
  }

  const BRAND_NORMALIZERS: { pattern: RegExp; canonical: string }[] = [
    { pattern: /SEVEN.?ELEVEN/i, canonical: "セブン-イレブン" },
    { pattern: /STAR.?BUCKS/i, canonical: "スターバックス" },
  ]

  for (const b of BRAND_NORMALIZERS) {
    if (b.pattern.test(fullText)) {
      if (/店$/.test(name)) {
        const parts = name.split(/\s+/)
        const branch = parts.slice(1).join(" ")
        return branch ? `${b.canonical} ${branch}`.trim() : b.canonical
      }
      return b.canonical
    }
  }

  return name
}

/** レシート向け抽出（店名/日付/合計/税） 改良版 */
function extractReceiptFields(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((s) => normalize(s))
    .filter(Boolean)

  const storeName = extractStoreName(lines, text)

  // ---- 合計金額 ----
  const primaryTotalKeywords = [/総合計/, /合計金額/, /お会計/, /TOTAL/i]
  let total = findAmountAfterKeyword(lines, primaryTotalKeywords)

  if (total == null) {
    const secondaryTotalKeywords = [/合計/, /合算/]
    total = findAmountAfterKeyword(lines, secondaryTotalKeywords)
  }

  if (total == null) {
    const yenAmounts = lines
      .flatMap((l) => [...l.matchAll(/¥\s*([０-９0-9]{1,3}(?:[,\s][０-９0-9]{3})*|[０-９0-9]+)/g)])
      .map((m) => parseAmount(m[1]))
      .filter((n): n is number => n != null)
    if (yenAmounts.length) total = Math.max(...yenAmounts)
  }

  // ---- 税額（％と混同しない）----
  const taxKeywords = [/消費税/, /内消費税/, /税額/, /税金/]
  let tax: number | undefined
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (taxKeywords.some((r) => r.test(l))) {
      if (/%/.test(l)) continue

      let candidates = findNumericAmounts(l)
      const next = lines[i + 1]
      if (next && !/%/.test(next)) {
        candidates = candidates.concat(findNumericAmounts(next))
      }

      if (candidates.length) {
        tax = Math.min(...candidates)
        break
      }
    }
  }

  // ---- 日付 ----
  let purchaseDate = ""
  {
    const m = lines
      .map((l) => l.match(/(\d{4})[/.年-](\d{1,2})[/.月-](\d{1,2})[日]?/))
      .find(Boolean) as RegExpMatchArray | undefined
    if (m) {
      const yyyy = m[1].padStart(4, "0")
      const mm = m[2].padStart(2, "0")
      const dd = m[3].padStart(2, "0")
      purchaseDate = `${yyyy}-${mm}-${dd}`
    }
  }

  return { storeName, purchaseDate, total, tax }
}

// ---- メイン処理 ----
export async function POST(req: Request) {
  try {
    // まずは認証ユーザーを取得
    const supabase = await createSupabaseServerClientReadonly()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      console.error("[/api/ocr] auth error:", authError)
      return bad(401, "unauthorized", authError?.message)
    }
    const supabaseUser = authData.user

    const ct = req.headers.get("content-type") || ""
    if (!ct.includes("multipart/form-data"))
      return bad(415, "content-type must be multipart/form-data")

    const form = await req.formData()
    const fileEntry = form.get("file")

    // ここで File 型に絞り込む（any 不要＆実行時にも安全）
    if (!(fileEntry instanceof File)) {
      return bad(400, "file is required")
    }
    const file = fileEntry

    if (!ALLOWED_MIME.has(file.type)) return bad(400, "unsupported file type")
    if (file.size > MAX_FILE_BYTES) return bad(400, "file too large (max 10MB)")

    console.log("[/api/ocr] incoming file:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    const url = new URL(req.url)
    const modeParam = url.searchParams.get("mode") || DEFAULT_MODE
    const mode = (modeParam === "document" ? "document" : "text") as "text" | "document"

    // 画像前処理：傾き補正 + グレースケール + 軽量化 + PNG化
    const buf = Buffer.from(await file.arrayBuffer())
    console.log("[/api/ocr] original buffer size (bytes):", buf.length)

    const preprocessed = await sharp(buf)
      .rotate()
      .grayscale()
      .resize({ width: 1600, withoutEnlargement: true })
      .toFormat("png")
      .toBuffer()

    console.log("[/api/ocr] preprocessed buffer size (bytes):", preprocessed.length)

    // Supabase Storage に保存（ユーザーごとにパスを分ける）
    const timestamp = Date.now()
    const storagePath = `${supabaseUser.id}/${timestamp}.png`

    const { error: uploadError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(storagePath, preprocessed, {
        contentType: "image/png",
        upsert: false,
      })

    if (uploadError) {
      console.error("[/api/ocr] storage upload error:", uploadError)
      return bad(
        500,
        "image upload failed",
        uploadError.message ??
          // @ts-expect-error supabase error 型によっては error / status などがある
          uploadError.error ??
          String(uploadError),
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(RECEIPT_BUCKET).getPublicUrl(storagePath)

    // URL表示
    console.log("[/api/ocr] publicUrl:", publicUrl)

    const client = createVisionClient()
    const image = { content: preprocessed }
    const imageContext = { languageHints: ["ja", "en"] as string[] }

    const [result] =
      mode === "document"
        ? await client.documentTextDetection({ image, imageContext })
        : await client.textDetection({ image, imageContext })

    const text = result.fullTextAnnotation?.text?.trim() || ""
    const confidence = estimateConfidence(result)

    const pages = (result.fullTextAnnotation?.pages ?? []) as Page[]
    const blocks = pages.flatMap((p: Page) =>
      (p.blocks ?? []).map((b: Block) => ({
        bbox: (b.boundingBox?.vertices ?? []).map((v: Vertex) => ({
          x: v?.x ?? 0,
          y: v?.y ?? 0,
        })),
        text: (b.paragraphs ?? [])
          .flatMap((pg) =>
            (pg.words ?? []).map((w) => (w.symbols ?? []).map((s) => s.text || "").join("")),
          )
          .join("\n"),
      })),
    )

    const extracted = extractReceiptFields(text)

    console.log("[/api/ocr] extracted:", extracted)
    console.log("[/api/ocr] raw text length:", text.length)
    console.log("[/api/ocr] image stored at:", storagePath)

    return NextResponse.json({
      text,
      confidence,
      blocks,
      extracted,
      mode,
      image: {
        path: storagePath,
        url: publicUrl,
      },
    })
  } catch (e) {
    console.error("[/api/ocr] Vision error:", e)
    const detail =
      e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e)
    return bad(500, "Vision API failed", detail)
  }
}
