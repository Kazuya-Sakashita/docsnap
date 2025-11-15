// src/components/scan/completion-view.tsx
"use client"

import Link from "next/link"
import { CheckCircle2, Eye, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"

type ReceiptStatus = "READY" | "PROCESSING" | "ERROR" | "DUPLICATE"

export interface CompletionViewProps {
  /** 保存済みレシートのID（詳細画面へ遷移に使用） */
  receiptId: string
  /** 完了後に「別レシート取り込み」を押したときのハンドラ */
  onStartOver: () => void
  /** 画面に表示するサマリー（OCR→保存後の値を渡す） */
  summary: {
    storeName: string
    purchaseDate: string // ISO or YYYY-MM-DD
    total: number
    status: ReceiptStatus
  }
}

const statusLabel: Record<ReceiptStatus, string> = {
  READY: "完了",
  PROCESSING: "処理中",
  ERROR: "エラー",
  DUPLICATE: "重複",
}

export function CompletionView({ receiptId, onStartOver, summary }: CompletionViewProps) {
  console.log("CompletionView props", { receiptId, summary })
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* 成功アイコン */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {/* successトークン未定義環境でも見栄えするように emerald 系でフォールバック */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold text-balance">解析が完了しました</h2>
          <p className="text-muted-foreground text-sm">レシート情報を確認・編集できます</p>
        </div>

        {/* サマリーカード */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">店舗名</p>
                  <p className="font-medium">{summary.storeName}</p>
                </div>
                <Badge>{statusLabel[summary.status]}</Badge>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">購入日</p>
                <p className="font-medium">{formatDate(summary.purchaseDate)}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm">合計金額</p>
                <p className="font-mono text-2xl font-bold">{formatCurrency(summary.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link href={`/receipts/${encodeURIComponent(receiptId)}`} className="block">
            <Button size="lg" className="tap-target w-full">
              <Eye className="mr-2 h-5 w-5" />
              詳細を確認・編集
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            className="tap-target w-full bg-transparent"
            onClick={onStartOver}
          >
            <ScanLine className="mr-2 h-5 w-5" />
            別のレシートを取り込む
          </Button>
        </div>

        {/* ダッシュボードへのリンク */}
        <div className="text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm hover:underline"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
