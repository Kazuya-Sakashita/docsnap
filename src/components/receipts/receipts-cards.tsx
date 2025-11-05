"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ReceiptIcon, FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Receipt, ReceiptStatus } from "@/types/receipt"

interface ReceiptsCardsProps {
  receipts: Receipt[]
  onSelect: (id: string) => void
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

export function ReceiptsCards({ receipts, onSelect }: ReceiptsCardsProps) {
  return (
    <div className="space-y-3">
      {receipts.map((receipt) => {
        const statusInfo = statusConfig[receipt.status]
        const isInvoice = receipt.type === "INVOICE"

        return (
          <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
            <Card className="transition-all hover:bg-accent hover:shadow-md hover:ring-2 hover:ring-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isInvoice ? (
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <ReceiptIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <p className="truncate font-medium">{receipt.storeName}</p>
                      <Badge variant={statusInfo.variant} className="shrink-0">
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(receipt.purchaseDate)}</p>
                    {isInvoice && receipt.invoiceNumber && (
                      <p className="mt-1 text-xs text-muted-foreground">No. {receipt.invoiceNumber}</p>
                    )}
                    {receipt.memo && <p className="mt-1 truncate text-sm text-muted-foreground">{receipt.memo}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono font-semibold">{formatCurrency(receipt.total)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{isInvoice ? "領収書" : "レシート"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
