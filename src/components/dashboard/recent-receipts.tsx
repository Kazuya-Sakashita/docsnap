"use client"

import { FileText, ReceiptIcon, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import { useRouter } from "next/navigation"

export function RecentReceipts() {
  const router = useRouter()

  // TODO: 実際のデータを取得
  const recentReceipts = [
    {
      id: "1",
      type: "RECEIPT",
      storeName: "イオン",
      purchaseDate: "2025-02-01",
      total: 4950,
      status: "READY",
    },
    {
      id: "2",
      type: "RECEIPT",
      storeName: "セブンイレブン",
      purchaseDate: "2025-01-31",
      total: 880,
      status: "READY",
    },
    {
      id: "3",
      type: "INVOICE",
      storeName: "株式会社ABC",
      purchaseDate: "2025-01-30",
      total: 55000,
      status: "READY",
    },
    {
      id: "4",
      type: "RECEIPT",
      storeName: "ガスト",
      purchaseDate: "2025-01-29",
      total: 3520,
      status: "READY",
    },
    {
      id: "5",
      type: "RECEIPT",
      storeName: "紀伊国屋書店",
      purchaseDate: "2025-01-28",
      total: 1980,
      status: "READY",
    },
  ]

  return (
    <Card className="border-blue-200 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-900">最近取り込み</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/receipts")}
          className="text-primary hover:text-primary"
        >
          すべて見る
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-blue-100 bg-white p-3 transition-all hover:border-primary hover:shadow-soft"
              onClick={() => router.push(`/receipts/${receipt.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {receipt.type === "RECEIPT" ? (
                    <ReceiptIcon className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{receipt.storeName}</p>
                  <p className="text-sm text-slate-500">{formatDate(receipt.purchaseDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{formatCurrency(receipt.total)}</p>
                <Badge variant={receipt.type === "RECEIPT" ? "default" : "secondary"} className="mt-1 text-xs">
                  {receipt.type === "RECEIPT" ? "レシート" : "領収書"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
