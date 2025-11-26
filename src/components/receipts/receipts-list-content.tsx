// src/components/receipts/receipts-list-content.tsx
"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ReceiptsFilter } from "./receipts-filter"
import { ReceiptsTable } from "./receipts-table"
import { ReceiptsCards } from "./receipts-cards"
import { ReceiptDetailPanel } from "./receipt-detail-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { Receipt } from "@/types/receipt"

export interface ReceiptsFilterState {
  dateFrom: string
  dateTo: string
  categoryId: string
  minAmount: string
  maxAmount: string
  status: string
  type?: string
}

// 共通 fetcher
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`)
    }
    return res.json()
  })

export function ReceiptsListContent() {
  // --- Supabase(API) からレシート取得 ---
  // 別途 /api/receipts の実装が必要です
const {
  data: receiptsData,
  isLoading,
  error,
} = useSWR<Receipt[]>("/api/receipts", fetcher)

const receipts = useMemo(() => receiptsData ?? [], [receiptsData])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "amount" | "updated">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filters, setFilters] = useState<ReceiptsFilterState>({
    dateFrom: "",
    dateTo: "",
    categoryId: "",
    minAmount: "",
    maxAmount: "",
    status: "",
    type: "",
  })

  const handleClearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      categoryId: "",
      minAmount: "",
      maxAmount: "",
      status: "",
      type: "",
    })
    setSearchQuery("")
  }

  const hasActiveFilters =
    searchQuery ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.categoryId ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.status ||
    filters.type

  // --- フィルタリングとソート ---
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((receipt) => {
        // 検索クエリ
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !receipt.storeName.toLowerCase().includes(query) &&
            !receipt.title.toLowerCase().includes(query) &&
            !(receipt.memo || "").toLowerCase().includes(query)
          ) {
            return false
          }
        }

        if (filters.type && filters.type !== "all" && receipt.type !== filters.type) {
          return false
        }

        // 日付範囲
        if (filters.dateFrom && receipt.purchaseDate < filters.dateFrom) {
          return false
        }
        if (filters.dateTo && receipt.purchaseDate > filters.dateTo) {
          return false
        }

        // カテゴリ
        if (filters.categoryId && receipt.categoryId !== filters.categoryId) {
          return false
        }

        // 金額範囲
        if (filters.minAmount && receipt.total < Number(filters.minAmount)) {
          return false
        }
        if (filters.maxAmount && receipt.total > Number(filters.maxAmount)) {
          return false
        }

        // ステータス
        if (filters.status && receipt.status !== filters.status) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        let comparison = 0
        if (sortBy === "date") {
          comparison = a.purchaseDate.localeCompare(b.purchaseDate)
        } else if (sortBy === "amount") {
          comparison = a.total - b.total
        } else if (sortBy === "updated") {
          comparison = a.updatedAt.localeCompare(b.updatedAt)
        }
        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [receipts, searchQuery, filters, sortBy, sortOrder])

  const selectedReceipt = receipts.find((r) => r.id === selectedReceiptId)

  // --- ローディング & エラー ---
  if (isLoading) {
    return <ReceiptsListSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-sm text-red-600">
          レシートの取得に失敗しました。時間をおいて再度お試しください。
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 md:p-6">
          {/* ヘッダー */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance text-slate-900 md:text-3xl">
              レシート一覧
            </h1>
            <p className="text-sm text-slate-600">{filteredReceipts.length}件のレシート</p>
          </div>

          {/* 検索とフィルタ */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="店舗名、メモで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-blue-200 pl-9"
              />
            </div>

            {/* モバイル: フィルタシート */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-transparent md:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  フィルタ
                  {hasActiveFilters && (
                    <span className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">フィルタ</h3>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                        <X className="mr-2 h-4 w-4" />
                        クリア
                      </Button>
                    )}
                  </div>
                  <ReceiptsFilter
                    filters={filters}
                    onChange={setFilters}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                      setSortBy(by)
                      setSortOrder(order)
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* PC: フィルタボタン */}
            <Button
              variant="outline"
              className="hidden bg-transparent md:flex"
              onClick={() => {
                const filterPanel = document.getElementById("filter-panel")
                filterPanel?.classList.toggle("hidden")
              }}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              フィルタ
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                  !
                </span>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="hidden md:flex"
              >
                <X className="mr-2 h-4 w-4" />
                クリア
              </Button>
            )}
          </div>

          {/* PC: フィルタパネル */}
          <div id="filter-panel" className="hidden md:block">
            <ReceiptsFilter
              filters={filters}
              onChange={setFilters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(by, order) => {
                setSortBy(by)
                setSortOrder(order)
              }}
            />
          </div>

          {/* 空状態 */}
          {filteredReceipts.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30 p-8">
              <div className="text-center">
                <p className="mb-2 font-medium text-slate-900">レシートが見つかりません</p>
                <p className="text-sm text-slate-600">
                  {hasActiveFilters ? "検索条件を変更してください" : "レシートを追加してください"}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-4 bg-transparent"
                  >
                    条件をリセット
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* モバイル: カード表示 */}
          {filteredReceipts.length > 0 && (
            <div className="md:hidden">
              <ReceiptsCards receipts={filteredReceipts} onSelect={setSelectedReceiptId} />
            </div>
          )}

          {/* PC: テーブル表示 */}
          {filteredReceipts.length > 0 && (
            <div className="hidden md:block">
              <ReceiptsTable
                receipts={filteredReceipts}
                selectedId={selectedReceiptId}
                onSelect={setSelectedReceiptId}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(by) => {
                  if (sortBy === by) {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  } else {
                    setSortBy(by)
                    setSortOrder("desc")
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* PC: 右ペイン詳細プレビュー */}
      {selectedReceipt && (
        <div className="border-border hidden w-96 border-l lg:block">
          <ReceiptDetailPanel
            receipt={selectedReceipt}
            onClose={() => setSelectedReceiptId(null)}
          />
        </div>
      )}
    </div>
  )
}

function ReceiptsListSkeleton() {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}
