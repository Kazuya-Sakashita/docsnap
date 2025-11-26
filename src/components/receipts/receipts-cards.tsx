// src/components/receipts/receipts-cards.tsx
"use client"

import type { FC } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import type { Receipt } from "@/types/receipt"

type ReceiptsCardsProps = {
  receipts: Receipt[]
  onSelect?: (id: string | null) => void
}

// ステータスごとのバッジ設定
const STATUS_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  READY: { label: "確定", variant: "secondary" },
  DRAFT: { label: "下書き", variant: "outline" },
  PROCESSING: { label: "処理中", variant: "default" },
  ERROR: { label: "エラー", variant: "destructive" },
  DUPLICATE: { label: "重複", variant: "outline" },
}

// 日付フォーマット（purchaseDate が string/Date どちらでも対応）
function formatPurchaseDate(value: string | Date) {
  if (!value) return "-"
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return format(d, "yyyy/MM/dd (EEE)", { locale: ja })
}

// 金額フォーマット（JPY 前提）
function formatAmount(value: number | string | null | undefined) {
  if (value == null) return "-"
  const n = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(n)) return "-"
  return n.toLocaleString("ja-JP", { style: "currency", currency: "JPY" })
}

// 種別表示
function formatType(type: Receipt["type"]) {
  switch (type) {
    case "INVOICE":
      return "請求書"
    case "RECEIPT":
    default:
      return "レシート"
  }
}

export const ReceiptsCards: FC<ReceiptsCardsProps> = ({ receipts, onSelect }) => {
  if (!receipts || receipts.length === 0) return null

  return (
    <div className="space-y-3">
      {receipts.map((receipt) => {
        const statusKey = (receipt.status ?? "READY") as string
        const statusInfo = STATUS_BADGE[statusKey] ?? STATUS_BADGE.READY

        return (
          <button
            key={receipt.id}
            type="button"
            onClick={() => onSelect?.(receipt.id)}
            className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-blue-300 hover:bg-blue-50/40"
          >
            {/* 1段目：店舗名 + ステータス */}
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="truncate font-medium text-slate-900">{receipt.storeName}</p>
              <Badge variant={statusInfo.variant} className="shrink-0 text-[11px]">
                {statusInfo.label}
              </Badge>
            </div>

            {/* 2段目：タイトル（メモ代わり） */}
            <p className="mb-2 line-clamp-2 text-sm text-slate-600">
              {receipt.title || receipt.memo || "タイトル未設定"}
            </p>

            {/* 3段目：日付・種別・金額 */}
            <div className="flex items-end justify-between gap-2 text-sm">
              <div className="space-y-1 text-xs text-slate-500">
                <p>{formatPurchaseDate(receipt.purchaseDate)}</p>
                <p className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                  {formatType(receipt.type)}
                  {receipt.invoiceNumber && (
                    <span className="text-[10px] text-slate-400">
                      / No. {receipt.invoiceNumber}
                    </span>
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">合計</p>
                <p className="text-base font-semibold text-slate-900">
                  {formatAmount(receipt.total)}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ReceiptsCards
