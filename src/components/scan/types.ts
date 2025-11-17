// src/components/scan/types.ts

// OCR モード
// ※ API 側は "text" も返しているので、ここにも含めておく
export type OcrMode = "text" | "document" | "receipt" | "invoice"

// --- 正規化後に最低限ほしいフィールドたち ---

export type MinimalTotals = { grandTotal?: number | string | null }
export type MinimalMerchant = { name?: string | null }

export type MinimalNormalized = {
  merchant?: MinimalMerchant | null
  purchasedAt?: string | null
  totals?: MinimalTotals | null
}

// --- /api/ocr の抽出サマリ（storeName / purchaseDate / total / tax） ---

export type OcrExtractedSummary = {
  storeName?: string | null
  purchaseDate?: string | null
  total?: number | null
  tax?: number | null
}

// --- /api/ocr の blocks 情報（単純化した形） ---

export type OcrBlock = {
  // boundingBox の各頂点
  bbox: { x: number; y: number }[]
  // そのブロック中のテキスト
  text: string
}

// --- /api/ocr の image 情報（Supabase Storage 上の画像） ---

export type OcrImageInfo = {
  // Supabase Storage のパス (例: "userId/timestamp.png")
  path: string
  // public URL (例: https://...supabase.co/storage/v1/object/public/receipts/...)
  url: string

  // 以下はあれば使うメタ情報（/api/receipts/import の ImportImage と揃えておく）
  mimeType?: string
  width?: number
  height?: number
  sha256?: string
  page?: number
}

// --- OCR API のレスポンス（/api/ocr の JSON に合わせた型） ---

export type OcrResponse = {
  // クライアント側で付与している一時 ID（scan 内での識別用）
  id: string

  mode: OcrMode

  // Vision API の全文テキスト
  text: string

  // 信頼度（0–100, /api/ocr の estimateConfidence）
  confidence?: number

  // ブロック情報（/api/ocr で組み立てている { bbox, text } の配列）
  blocks?: OcrBlock[]

  // 1枚のレシートから抜き出した店名・日付・合計・税など
  extracted?: OcrExtractedSummary

  // 既存の正規化結果（parseOcrToReceipt 由来の薄い情報）
  normalized?: MinimalNormalized | null

  // 旧フィールドとの互換用（あれば）
  receipt?: MinimalNormalized | null

  // Supabase Storage に保存した画像の情報
  image?: OcrImageInfo
}

// Completion / Processing 間で使う薄い型
export type OcrResultShallow = OcrResponse & {
  receiptId?: string
  saved?: { id: string }
}
