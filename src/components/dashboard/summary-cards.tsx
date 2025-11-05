"use client"

import { TrendingUp, Receipt, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"

export function SummaryCards() {
  // TODO: 実際のデータを取得
  const summary = {
    total: 125430,
    count: 23,
    average: 5453,
    trend: 15.9,
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 今月の合計 */}
      <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-soft">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5" />
        <CardContent className="relative p-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-slate-600">今月の合計</p>
          </div>
          <p className="mb-1 text-3xl font-bold text-slate-900">{formatCurrency(summary.total)}</p>
          <p className="flex items-center gap-1 text-sm text-slate-600">
            <TrendingUp className="h-4 w-4 text-success" />
            前月比 <span className="font-semibold text-success">+{summary.trend}%</span>
          </p>
        </CardContent>
      </Card>

      {/* レシート件数 */}
      <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-indigo-50 to-white shadow-soft">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/5" />
        <CardContent className="relative p-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Receipt className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-600">レシート件数</p>
          </div>
          <p className="mb-1 text-3xl font-bold text-slate-900">{summary.count}件</p>
          <p className="text-sm text-slate-600">今月登録済み</p>
        </CardContent>
      </Card>

      {/* 平均単価 */}
      <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-sky-50 to-white shadow-soft">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sky-500/5" />
        <CardContent className="relative p-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
              <DollarSign className="h-5 w-5 text-sky-600" />
            </div>
            <p className="text-sm font-medium text-slate-600">平均単価</p>
          </div>
          <p className="mb-1 text-3xl font-bold text-slate-900">{formatCurrency(summary.average)}</p>
          <p className="text-sm text-slate-600">1件あたり</p>
        </CardContent>
      </Card>
    </div>
  )
}
