// 例: src/components/receipt/types.ts
export type ReceiptItem = {
  name: string
  qty: number
  unitPrice: number | null
  total: number | null
  taxRate?: number | null
  notes?: string | null
  raw?: string | null // persistで rawLine に入れているので用意
}

export type NormalizedReceipt = {
  merchant: {
    name: string | null
    branch?: string | null
    address?: string | null
    phone?: string | null
    registerNo?: string | null
    // ✅ ここからは外す: invoiceNo はトップレベルで管理
    // invoiceNo?: string | null
  }
  purchasedAt: string
  /** ✅ トップレベルに移動 */
  invoiceNo?: string | null

  items: ReceiptItem[]

  totals: {
    subtotal8: number
    tax8: number
    subtotal10: number
    tax10: number
    grandTotal: number
    paid: number
    change: number
  }

  /** persistで meta?.parser を参照しているので optional で用意 */
  meta?: {
    source?: string
    parser?: string
    confidence?: number
    warnings?: string[]
  }
}
