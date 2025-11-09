// src/components/dashboard/dashboard-content.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryCards } from "./summary-cards"
import { CategoryChart } from "./category-chart"
import { RecentReceipts } from "./recent-receipts"
import { EmptyState } from "./empty-state"
import { useUser } from "@/hooks/useUser"

export function DashboardContent() {
  const router = useRouter()
  const hasReceipts = true // TODO: 実際のデータから判定

  // SWRのユーザー情報
  const { user, loading: userLoading, error: userError } = useUser()
  console.debug("[Dashboard] Render with user:", user)

  // ログ出力
  useEffect(() => {
    console.debug("[Dashboard] SWR user loading:", userLoading)
  }, [userLoading])
  useEffect(() => {
    console.debug("[Dashboard] SWR user data:", user)
  }, [user])
  useEffect(() => {
    if (userError) console.error("[Dashboard] SWR user error:", userError)
  }, [userError])

  if (userLoading) {
    return <div>Loading...</div>
  }

  if (!hasReceipts) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance text-slate-900 md:text-3xl">
            ダッシュボード
          </h1>
          <p className="text-sm text-slate-600">今月の支出状況を確認できます</p>
          <p className="mt-1 text-xs text-slate-500">
            {user ? `ログイン中: ${user.email ?? "メール未設定"}` : "未ログイン"}
          </p>
        </div>
        {/* PC: スキャンボタン */}
        <Button
          size="lg"
          className="gradient-primary hidden hover:opacity-90 md:flex"
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

      {/* モバイル: 浮遊スキャンボタン */}
      <Button
        size="lg"
        className="gradient-primary shadow-soft-lg fixed right-4 bottom-20 h-14 w-14 rounded-full p-0 hover:opacity-90 md:hidden"
        onClick={() => router.push("/scan")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
