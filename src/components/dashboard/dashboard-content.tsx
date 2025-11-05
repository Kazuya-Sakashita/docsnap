"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryCards } from "./summary-cards"
import { CategoryChart } from "./category-chart"
import { RecentReceipts } from "./recent-receipts"
import { EmptyState } from "./empty-state"
import { useRouter } from "next/navigation"

export function DashboardContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const hasReceipts = true // TODO: 実際のデータから判定

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!hasReceipts) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">ダッシュボード</h1>
          <p className="text-sm text-slate-600">今月の支出状況を確認できます</p>
        </div>
        {/* PC: スキャンボタン */}
        <Button
          size="lg"
          className="hidden gradient-primary hover:opacity-90 md:flex"
          onClick={() => router.push("/scan")}
        >
          <Plus className="mr-2 h-5 w-5" />
          スキャン
        </Button>
      </div>

      {/* サマリーカード */}
      <SummaryCards />

      {/* グラフとレシート */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryChart />
        <RecentReceipts />
      </div>

      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full p-0 gradient-primary shadow-soft-lg hover:opacity-90 md:hidden"
        onClick={() => router.push("/scan")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
