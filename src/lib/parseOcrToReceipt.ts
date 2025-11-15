// src/lib/parseOcrToReceipt.ts
import type { NormalizedReceipt } from "@/components/receipt/types"

export function parseOcrToReceipt(_rawText: string): NormalizedReceipt {
  const now = new Date()

  return {
    merchant: {
      name: "不明な店舗",
      branch: null,
      address: null,
      phone: null,
      registerNo: null,
    },
    purchasedAt: now.toISOString(),
    invoiceNo: null,
    // ✅ register削除
    items: [
      {
        name: "不明な品目",
        qty: 1,
        unitPrice: 0,
        total: 0,
        taxRate: 10,
      },
    ],
    totals: {
      subtotal8: 0,
      tax8: 0,
      subtotal10: 0,
      tax10: 0,
      grandTotal: 0,
      paid: 0,
      change: 0,
    },
  }
}
