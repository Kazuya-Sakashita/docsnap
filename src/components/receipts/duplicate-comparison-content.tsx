"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Receipt } from "@/types/receipt"

interface DuplicateComparisonContentProps {
  receiptId: string
}

// ダミーデータ
const currentReceipt: Receipt = {
  id: "receipt-new",
  userId: "user1",
  title: "書店",
  storeName: "紀伊國屋書店",
  purchaseDate: "2025-01-28",
  currency: "JPY",
  subtotal: 1800,
  tax: 180,
  total: 1980,
  status: "DUPLICATE",
  items: [{ id: "1", name: "ビジネス書", quantity: 1, unitPrice: 1800, amount: 1800 }],
  createdAt: "2025-01-28T16:00:00Z",
  updatedAt: "2025-01-28T16:00:00Z",
}

const duplicateCandidates: (Receipt & { similarityScore: number })[] = [
  {
    id: "receipt-old-1",
    userId: "user1",
    title: "書店",
    storeName: "紀伊國屋書店",
    purchaseDate: "2025-01-28",
    currency: "JPY",
    subtotal: 1800,
    tax: 180,
    total: 1980,
    status: "READY",
    items: [{ id: "1", name: "ビジネス書", quantity: 1, unitPrice: 1800, amount: 1800 }],
    createdAt: "2025-01-28T15:30:00Z",
    updatedAt: "2025-01-28T15:30:00Z",
    similarityScore: 0.95,
  },
  {
    id: "receipt-old-2",
    userId: "user1",
    title: "書店",
    storeName: "紀伊國屋書店 新宿店",
    purchaseDate: "2025-01-28",
    currency: "JPY",
    subtotal: 1850,
    tax: 185,
    total: 2035,
    status: "READY",
    items: [{ id: "1", name: "ビジネス書", quantity: 1, unitPrice: 1850, amount: 1850 }],
    createdAt: "2025-01-28T14:00:00Z",
    updatedAt: "2025-01-28T14:00:00Z",
    similarityScore: 0.82,
  },
]

export function DuplicateComparisonContent({ receiptId }: DuplicateComparisonContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const candidate = duplicateCandidates[currentIndex]

  const handleKeepExisting = async () => {
    // TODO: 実際の処理
    toast({
      title: "既存を採用しました",
      description: "新しいレシートは削除されました",
    })
    router.push("/receipts")
  }

  const handleKeepNew = async () => {
    // TODO: 実際の処理
    toast({
      title: "新規として保存しました",
      description: "両方のレシートが保存されています",
    })
    router.push(`/receipts/${receiptId}`)
  }

  const handleMerge = async () => {
    // TODO: 実際の処理
    toast({
      title: "マージしました",
      description: "レシート情報を統合しました",
    })
    router.push(`/receipts/${receiptId}`)
  }

  const differences = [
    {
      field: "店舗名",
      current: currentReceipt.storeName,
      candidate: candidate.storeName,
      isDifferent: currentReceipt.storeName !== candidate.storeName,
    },
    {
      field: "購入日",
      current: formatDate(currentReceipt.purchaseDate),
      candidate: formatDate(candidate.purchaseDate),
      isDifferent: currentReceipt.purchaseDate !== candidate.purchaseDate,
    },
    {
      field: "合計金額",
      current: formatCurrency(currentReceipt.total),
      candidate: formatCurrency(candidate.total),
      isDifferent: currentReceipt.total !== candidate.total,
    },
    {
      field: "作成日時",
      current: formatDateTime(currentReceipt.createdAt),
      candidate: formatDateTime(candidate.createdAt),
      isDifferent: true,
    },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-4">
          <Link href={`/receipts/${receiptId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-balance text-2xl font-bold">重複候補の比較</h1>
            <p className="text-sm text-muted-foreground">
              {duplicateCandidates.length}件の候補が見つかりました（{currentIndex + 1}/{duplicateCandidates.length}）
            </p>
          </div>
        </div>

        {/* 類似度 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            類似スコア: {(candidate.similarityScore * 100).toFixed(0)}%
            {candidate.similarityScore > 0.9 && " - 非常に高い類似度です"}
          </AlertDescription>
        </Alert>

        {/* 比較カード */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 新しいレシート */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">新しいレシート</CardTitle>
                <Badge>新規</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReceiptComparisonCard receipt={currentReceipt} />
            </CardContent>
          </Card>

          {/* 既存のレシート */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">既存のレシート</CardTitle>
                <Badge variant="secondary">既存</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReceiptComparisonCard receipt={candidate} />
            </CardContent>
          </Card>
        </div>

        {/* 差分ハイライト */}
        <Card>
          <CardHeader>
            <CardTitle>差分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {differences.map((diff) => (
                <div
                  key={diff.field}
                  className={cn("grid grid-cols-3 gap-4 rounded-lg p-3", diff.isDifferent && "bg-warning/10")}
                >
                  <div className="font-medium">{diff.field}</div>
                  <div className={cn(diff.isDifferent && "text-primary")}>{diff.current}</div>
                  <div className={cn(diff.isDifferent && "text-muted-foreground")}>{diff.candidate}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ナビゲーション */}
        {duplicateCandidates.length > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {duplicateCandidates.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.min(duplicateCandidates.length - 1, currentIndex + 1))}
              disabled={currentIndex === duplicateCandidates.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* アクションボタン */}
        <div className="grid gap-3 md:grid-cols-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="tap-target bg-transparent">
                既存を採用
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>既存のレシートを採用しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  新しいレシートは削除され、既存のレシートが保持されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleKeepExisting}>既存を採用</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={handleKeepNew} className="tap-target bg-transparent">
            新規として保存
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="tap-target">マージして保存</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>レシートをマージしますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  新しいレシートの情報で既存のレシートを更新します。この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleMerge}>マージして保存</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

function ReceiptComparisonCard({ receipt }: { receipt: Receipt }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">店舗名</p>
        <p className="font-medium">{receipt.storeName}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">購入日</p>
        <p>{formatDate(receipt.purchaseDate)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">合計金額</p>
        <p className="font-mono text-xl font-bold">{formatCurrency(receipt.total)}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">作成日時</p>
        <p className="text-sm">{formatDateTime(receipt.createdAt)}</p>
      </div>
      {receipt.items.length > 0 && (
        <div>
          <p className="mb-1 text-sm text-muted-foreground">明細</p>
          <div className="space-y-1">
            {receipt.items.map((item) => (
              <p key={item.id} className="text-sm">
                {item.name} × {item.quantity}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
