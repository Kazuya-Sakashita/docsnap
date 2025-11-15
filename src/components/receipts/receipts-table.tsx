// src/components/receipts/receipts-table.tsx
"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { ArrowUpDown, ReceiptIcon, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Receipt } from "@/types/receipt"

interface ReceiptsTableProps {
  receipts: Receipt[]
  selectedId: string | null
  onSelect: (id: string) => void
  sortBy: "date" | "amount" | "updated"
  sortOrder: "asc" | "desc"
  onSort: (by: "date" | "amount" | "updated") => void
}

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

// status文字列 → 表示設定のマップ
const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  READY: { label: "完了", variant: "default" },
  DRAFT: { label: "下書き", variant: "outline" },
  ARCHIVED: { label: "アーカイブ", variant: "outline" },
  DUPLICATE: { label: "重複", variant: "secondary" },
  ERROR: { label: "エラー", variant: "destructive" },
  // 将来 PROCESSING など増えてもここに足せばOK
}

export function ReceiptsTable({
  receipts,
  selectedId,
  onSelect,
  sortBy: _sortBy, // いまは未使用なので ESLint 対策
  sortOrder: _sortOrder,
  onSort,
}: ReceiptsTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">種別</TableHead>
            <TableHead>店舗名</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("date")}
                className="-ml-3"
              >
                購入日
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("amount")}
                className="-ml-3"
              >
                金額
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("updated")}
                className="-ml-3"
              >
                更新日
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => {
            const statusInfo =
              statusConfig[receipt.status] ??
              ({
                label: receipt.status,
                variant: "outline" as BadgeVariant,
              } as const)

            const isSelected = receipt.id === selectedId
            const isInvoice = receipt.type === "INVOICE"

            return (
              <TableRow
                key={receipt.id}
                className={cn("cursor-pointer", isSelected && "bg-accent")}
                onClick={() => onSelect(receipt.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isInvoice ? (
                      <>
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">領収書</span>
                      </>
                    ) : (
                      <>
                        <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">レシート</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/receipts/${receipt.id}`}
                    className="font-medium hover:underline"
                  >
                    {receipt.storeName}
                  </Link>
                  {isInvoice && receipt.invoiceNumber && (
                    <p className="text-xs text-muted-foreground">
                      No. {receipt.invoiceNumber}
                    </p>
                  )}
                  {receipt.memo && (
                    <p className="text-sm text-muted-foreground">{receipt.memo}</p>
                  )}
                </TableCell>
                <TableCell>{formatDate(receipt.purchaseDate)}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {formatCurrency(receipt.total)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(receipt.updatedAt)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
