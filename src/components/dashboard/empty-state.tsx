"use client"

import { Receipt, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function EmptyState() {
  const router = useRouter()

  return (
    <div className="flex min-h-[600px] items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
          <Receipt className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">レシートがありません</h2>
        <p className="mb-8 text-slate-600">最初のレシートをスキャンして、家計管理を始めましょう</p>
        <Button size="lg" className="gradient-primary hover:opacity-90" onClick={() => router.push("/scan")}>
          <Plus className="mr-2 h-5 w-5" />
          レシートをスキャン
        </Button>
      </div>
    </div>
  )
}
