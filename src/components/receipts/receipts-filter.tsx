"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { ReceiptsFilterState } from "./receipts-list-content"

interface ReceiptsFilterProps {
  filters: ReceiptsFilterState
  onChange: (filters: ReceiptsFilterState) => void
  sortBy: "date" | "amount" | "updated"
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: "date" | "amount" | "updated", sortOrder: "asc" | "desc") => void
}

export function ReceiptsFilter({ filters, onChange, sortBy, sortOrder, onSortChange }: ReceiptsFilterProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* 並び替え */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sortBy">並び替え</Label>
            <Select
              value={sortBy}
              onValueChange={(value) => onSortChange(value as "date" | "amount" | "updated", sortOrder)}
            >
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">購入日</SelectItem>
                <SelectItem value="amount">金額</SelectItem>
                <SelectItem value="updated">更新日</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">順序</Label>
            <Select value={sortOrder} onValueChange={(value) => onSortChange(sortBy, value as "asc" | "desc")}>
              <SelectTrigger id="sortOrder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">降順</SelectItem>
                <SelectItem value="asc">昇順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 種別 */}
        <div className="space-y-2">
          <Label htmlFor="type">種別</Label>
          <Select value={filters.type || "all"} onValueChange={(value) => onChange({ ...filters, type: value })}>
            <SelectTrigger id="type">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="RECEIPT">レシート</SelectItem>
              <SelectItem value="INVOICE">領収書</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 期間 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">開始日</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo">終了日</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>

        {/* カテゴリ */}
        <div className="space-y-2">
          <Label htmlFor="category">カテゴリ</Label>
          <Select value={filters.categoryId} onValueChange={(value) => onChange({ ...filters, categoryId: value })}>
            <SelectTrigger id="category">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="cat1">食費</SelectItem>
              <SelectItem value="cat2">交通費</SelectItem>
              <SelectItem value="cat3">娯楽</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 金額範囲 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="minAmount">最小金額</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => onChange({ ...filters, minAmount: e.target.value })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">最大金額</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="999999"
              value={filters.maxAmount}
              onChange={(e) => onChange({ ...filters, maxAmount: e.target.value })}
              className="font-mono"
            />
          </div>
        </div>

        {/* ステータス */}
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <Select value={filters.status} onValueChange={(value) => onChange({ ...filters, status: value })}>
            <SelectTrigger id="status">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="READY">完了</SelectItem>
              <SelectItem value="PROCESSING">解析中</SelectItem>
              <SelectItem value="ERROR">エラー</SelectItem>
              <SelectItem value="DUPLICATE">重複</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
