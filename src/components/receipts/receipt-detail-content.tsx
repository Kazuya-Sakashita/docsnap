"use client"

import { useState } from "react"
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ReceiptImagePreview } from "./receipt-image-preview"
import { ReceiptEditForm } from "./receipt-edit-form"
import { ReceiptItemsTable } from "./receipt-items-table"
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
import type { Receipt, ReceiptItem } from "@/types/receipt"

interface ReceiptDetailContentProps {
  receiptId: string
}

// ダミーデータ
const dummyReceipt: Receipt = {
  id: "receipt-123",
  userId: "user1",
  title: "スーパーマーケット",
  storeName: "イオン",
  purchaseDate: "2025-02-02",
  currency: "JPY",
  subtotal: 4500,
  tax: 450,
  total: 4950,
  memo: "",
  status: "READY",
  confidenceScore: 0.95,
  imageUrl: "/paper-receipt.png",
  items: [
    { id: "1", name: "牛乳", quantity: 2, unitPrice: 200, amount: 400 },
    { id: "2", name: "食パン", quantity: 1, unitPrice: 180, amount: 180 },
    { id: "3", name: "たまご", quantity: 1, unitPrice: 250, amount: 250 },
    { id: "4", name: "トマト", quantity: 3, unitPrice: 150, amount: 450 },
  ],
  createdAt: "2025-02-02T10:30:00Z",
  updatedAt: "2025-02-02T10:30:00Z",
}

export function ReceiptDetailContent({ receiptId }: ReceiptDetailContentProps) {
  const [receipt, setReceipt] = useState<Receipt>(dummyReceipt)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)

    // TODO: 実際の保存処理
    setTimeout(() => {
      toast({
        title: "保存しました",
        description: "レシート情報を更新しました",
      })
      setIsSaving(false)
    }, 1000)
  }

  const handleDelete = async () => {
    // TODO: 実際の削除処理
    toast({
      title: "削除しました",
      description: "レシートを削除しました",
    })
    router.push("/receipts")
  }

  const handleFormChange = (updates: Partial<Receipt>) => {
    setReceipt({ ...receipt, ...updates })
  }

  const handleItemsChange = (items: ReceiptItem[]) => {
    // 合計を再計算
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const tax = Math.round(subtotal * 0.1)
    const total = subtotal + tax

    setReceipt({
      ...receipt,
      items,
      subtotal,
      tax,
      total,
    })
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 border-b border-blue-200 bg-white/95 backdrop-blur shadow-soft">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <Link href="/receipts">
              <Button variant="ghost" size="icon" className="tap-target">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">戻る</span>
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900">レシート詳細</h1>
              <p className="text-xs text-slate-500">ID: {receiptId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="tap-target text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">削除</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>レシートを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。レシートとすべての関連データが完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-2 lg:gap-8">
        {/* 左側: 画像プレビュー */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <ReceiptImagePreview imageUrl={receipt.imageUrl} />
        </div>

        {/* 右側: 編集フォーム */}
        <div className="space-y-6">
          <ReceiptEditForm receipt={receipt} onChange={handleFormChange} />

          <ReceiptItemsTable
            items={receipt.items}
            subtotal={receipt.subtotal}
            tax={receipt.tax}
            total={receipt.total}
            onChange={handleItemsChange}
          />
        </div>
      </div>

      {/* 下部固定バー */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-blue-200 bg-white/95 p-4 backdrop-blur shadow-soft-lg md:left-64">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/receipts" className="hidden md:block">
            <Button variant="outline">キャンセル</Button>
          </Link>

          {receipt.status === "DUPLICATE" && (
            <Link href={`/receipts/${receiptId}/duplicates`} className="flex-1 md:flex-initial">
              <Button variant="outline" className="w-full tap-target bg-transparent">
                <AlertTriangle className="mr-2 h-4 w-4" />
                重複候補を見る
              </Button>
            </Link>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="tap-target flex-1 gradient-primary hover:opacity-90 md:flex-initial md:min-w-[120px]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* スペーサー（固定バーの高さ分） */}
      <div className="h-20" />
    </div>
  )
}
