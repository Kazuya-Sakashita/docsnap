// src/components/scan/types.ts
export type OcrMode = "document" | "receipt" | "invoice"

export type MinimalTotals = { grandTotal?: number | string | null }
export type MinimalMerchant = { name?: string | null }
export type MinimalNormalized = {
  merchant?: MinimalMerchant | null
  purchasedAt?: string | null
  totals?: MinimalTotals | null
}

// OCR API のレスポンス（元々の OcrResponse に合わせて調整）
export type OcrResponse = {
  id: string
  mode: OcrMode
  text: string
  // 他にもあればここに
  normalized?: MinimalNormalized | null
  receipt?: MinimalNormalized | null
}

// Completion / Processing 間で使う薄い型
export type OcrResultShallow = OcrResponse & {
  receiptId?: string
  saved?: { id: string }
}
