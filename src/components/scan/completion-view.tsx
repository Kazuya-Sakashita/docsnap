"use client"

import Link from "next/link"
import { CheckCircle2, Eye, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"

interface CompletionViewProps {
  receiptId: string
  onStartOver: () => void
}

// ダミーデータ
const receiptSummary = {
  storeName: "イオン",
  purchaseDate: "2025-02-02",
  total: 4950,
  status: "READY" as const,
}

export function CompletionView({ receiptId, onStartOver }: CompletionViewProps) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 成功アイコン */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <h2 className="text-balance mb-2 text-xl font-bold">解析が完了しました</h2>
          <p className="text-sm text-muted-foreground">レシート情報を確認・編集できます</p>
        </div>

        {/* サマリーカード */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">店舗名</p>
                  <p className="font-medium">{receiptSummary.storeName}</p>
                </div>
                <Badge>完了</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">購入日</p>
                <p className="font-medium">{formatDate(receiptSummary.purchaseDate)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">合計金額</p>
                <p className="font-mono text-2xl font-bold">{formatCurrency(receiptSummary.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link href={`/receipts/${receiptId}`} className="block">
            <Button size="lg" className="tap-target w-full">
              <Eye className="mr-2 h-5 w-5" />
              詳細を確認・編集
            </Button>
          </Link>

          <Button size="lg" variant="outline" className="tap-target w-full bg-transparent" onClick={onStartOver}>
            <ScanLine className="mr-2 h-5 w-5" />
            別のレシートを取り込む
          </Button>
        </div>

        {/* ダッシュボードへのリンク */}
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
