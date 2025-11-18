// src/components/receipts/receipt-detail-content.tsx
"use client"

import { useEffect, useState } from "react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Receipt, ReceiptItem } from "@/types/receipt"

interface ReceiptDetailContentProps {
  receiptId: string
}

// API からのレスポンスでは files が付いてくる前提なので、
// このコンポーネント内だけの拡張型を定義しておく
type ReceiptWithFiles = Receipt & {
  files?: {
    id?: string
    url?: string | null
    page?: number | null
    mimeType?: string | null
    width?: number | null
    height?: number | null
    sha256?: string | null
  }[]
}

// エラーメッセージ整形用ヘルパー
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  try {
    return JSON.stringify(err)
  } catch {
    return "不明なエラーが発生しました"
  }
}

export function ReceiptDetailContent({ receiptId }: ReceiptDetailContentProps) {
  const [receipt, setReceipt] = useState<ReceiptWithFiles | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  // ========= 1. 初期ロード：DB からレシートを取得 =========
  useEffect(() => {
    let cancelled = false

    const fetchReceipt = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/receipts/${receiptId}`, {
          method: "GET",
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(`レシートの取得に失敗しました (${res.status})`)
        }

        const data = await res.json()
        // {"ok":true,"receipt":{...}} または 直接 { ... } の両方に対応
        const loaded = (data.receipt ?? data) as ReceiptWithFiles

        if (!cancelled) {
          console.log("[ReceiptDetail] loaded receipt from API:", loaded)
          setReceipt(loaded)
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err))
          setReceipt(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchReceipt()

    return () => {
      cancelled = true
    }
  }, [receiptId])

  // ========= 2. 保存処理 =========
  const handleSave = async () => {
    if (!receipt) return
    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receipt }),
      })

      if (!res.ok) {
        throw new Error(`保存に失敗しました (${res.status})`)
      }

      const data = await res.json()
      const updated = (data.receipt ?? data) as ReceiptWithFiles

      setReceipt(updated)

      toast({
        title: "保存しました",
        description: "レシート情報を更新しました",
      })
    } catch (err) {
      setError(getErrorMessage(err))
      toast({
        title: "保存に失敗しました",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ========= 3. 削除処理 =========
  const handleDelete = async () => {
    setError(null)

    try {
      const res = await fetch(`/api/receipts/${receiptId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error(`削除に失敗しました (${res.status})`)
      }

      toast({
        title: "削除しました",
        description: "レシートを削除しました",
      })

      router.push("/receipts")
    } catch (err) {
      setError(getErrorMessage(err))
      toast({
        title: "削除に失敗しました",
        description: getErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  // ========= 4. フォームの変更反映 =========
  const handleFormChange = (updates: Partial<ReceiptWithFiles>) => {
    setReceipt((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const handleItemsChange = (items: ReceiptItem[]) => {
    setReceipt((prev) => {
      if (!prev) return prev

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
      const tax = Math.round(subtotal * 0.1)
      const total = subtotal + tax

      return {
        ...prev,
        items,
        subtotal,
        tax,
        total,
      }
    })
  }

  // ========= 5. ローディング・エラー状態の表示 =========
  if (isLoading && !receipt) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 border-b border-blue-200 bg-white/95 backdrop-blur shadow-soft">
          <div className="flex items-center gap-3 p-4">
            <Link href="/receipts">
              <Button variant="ghost" size="icon" className="tap-target">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">戻る</span>
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900">レシート詳細</h1>
              <p className="text-xs text-slate-500">読み込み中...</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-xl bg-slate-100" />
            <div className="h-40 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !receipt) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 border-b border-blue-200 bg-white/95 backdrop-blur shadow-soft">
          <div className="flex items-center gap-3 p-4">
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
        </div>

        <div className="p-4 md:p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>レシートが取得できませんでした</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/receipts">一覧に戻る</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ここまで来たら receipt は存在する前提
  if (!receipt) return null

  // ========= 6. 画像 URL の決定ロジック =========
  // files の中で最初に url を持っているものを採用
  const fileUrl = receipt.files?.find((f) => !!f.url)?.url ?? null

  const mainImageUrl =
    fileUrl ??
    receipt.imageUrl ??
    "/paper-receipt.png"

  // ★ デバッグログ（ここが重要）
  console.log("[ReceiptDetail] receipt.id:", receipt.id)
  console.log("[ReceiptDetail] files from API:", receipt.files)
  console.log("[ReceiptDetail] receipt.imageUrl:", receipt.imageUrl)
  console.log("[ReceiptDetail] chosen mainImageUrl:", mainImageUrl)

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

      {/* エラーがある場合は画面上部に表示 */}
      {error && (
        <div className="p-4 md:p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-2 lg:gap-8">
        {/* 左側: 画像プレビュー */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <ReceiptImagePreview imageUrl={mainImageUrl} />
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
