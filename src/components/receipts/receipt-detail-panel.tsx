"use client"

import Link from "next/link"
import { X, ExternalLink, ReceiptIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate, formatAmount } from "@/lib/format"
import type { Receipt, ReceiptStatus } from "@/types/receipt"

interface ReceiptDetailPanelProps {
  receipt: Receipt
  onClose: () => void
}

const statusConfig: Record<
  ReceiptStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "warning" }
> = {
  READY: { label: "完了", variant: "default" },
  PROCESSING: { label: "解析中", variant: "secondary" },
  ERROR: { label: "エラー", variant: "destructive" },
  DUPLICATE: { label: "重複", variant: "warning" },
}

export function ReceiptDetailPanel({ receipt, onClose }: ReceiptDetailPanelProps) {
  const statusInfo = statusConfig[receipt.status]
  const isInvoice = receipt.type === "INVOICE"

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold">詳細プレビュー</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                {isInvoice ? (
                  <>
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">領収書</span>
                  </>
                ) : (
                  <>
                    <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">レシート</span>
                  </>
                )}
              </div>
              <h4 className="text-lg font-semibold">{receipt.storeName}</h4>
              <p className="text-sm text-muted-foreground">{receipt.title}</p>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            {isInvoice && receipt.invoiceNumber && (
              <div>
                <p className="text-sm text-muted-foreground">領収書番号</p>
                <p className="font-medium">{receipt.invoiceNumber}</p>
              </div>
            )}

            {isInvoice && receipt.recipientName && (
              <div>
                <p className="text-sm text-muted-foreground">宛名</p>
                <p className="font-medium">{receipt.recipientName}</p>
              </div>
            )}

            {isInvoice && receipt.purpose && (
              <div>
                <p className="text-sm text-muted-foreground">但書</p>
                <p className="font-medium">{receipt.purpose}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">{isInvoice ? "発行日" : "購入日"}</p>
              <p className="font-medium">{formatDate(receipt.purchaseDate)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">合計金額</p>
              <p className="font-mono text-2xl font-bold">{formatCurrency(receipt.total)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">小計</p>
                <p className="font-mono">{formatAmount(receipt.subtotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">税</p>
                <p className="font-mono">{formatAmount(receipt.tax)}</p>
              </div>
            </div>

            {isInvoice && receipt.paymentMethod && (
              <div>
                <p className="text-sm text-muted-foreground">支払方法</p>
                <p className="font-medium">{receipt.paymentMethod}</p>
              </div>
            )}

            {receipt.memo && (
              <div>
                <p className="text-sm text-muted-foreground">メモ</p>
                <p className="text-sm">{receipt.memo}</p>
              </div>
            )}
          </div>

          {receipt.items.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">明細</p>
                <div className="space-y-2">
                  {receipt.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-mono">{formatAmount(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* フッター */}
      <div className="border-t border-border p-4">
        <Link href={`/receipts/${receipt.id}`} className="block">
          <Button className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            詳細を開く
          </Button>
        </Link>
      </div>
    </div>
  )
}
