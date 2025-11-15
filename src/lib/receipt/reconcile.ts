// src/lib/receipt/reconcile.ts
import type { NormalizedReceipt } from "@/components/receipt/types"

export function reconcile(r: NormalizedReceipt): NormalizedReceipt {
  const items = r.items.map((it) => {
    const qty = it.qty ?? 1
    const total = it.total ?? (it.unitPrice != null ? it.unitPrice * qty : null)
    const unitPrice = it.unitPrice ?? (total != null ? Math.round(total / qty) : null)
    return { ...it, qty, unitPrice, total }
  })

  // grandTotal が無ければ行合計の和を使う
  const sum = items.reduce((a, b) => a + (b.total || 0), 0)
  const totals = {
    ...r.totals,
    grandTotal: r.totals.grandTotal ?? (sum || null),
  }

  return { ...r, items, totals }
}
