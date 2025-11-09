// src/components/desktop-sidebar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ScanLine, List, Settings, Receipt, FolderOpen, Download, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "ダッシュボード", icon: Home },
  { href: "/scan", label: "スキャン", icon: ScanLine },
  { href: "/receipts", label: "レシート一覧", icon: List },
  { href: "/categories", label: "カテゴリ", icon: FolderOpen },
  { href: "/export", label: "エクスポート", icon: Download },
  { href: "/settings", label: "設定", icon: Settings },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // ← Cookie 同送
        headers: { "Content-Type": "application/json" },
      })

      if (res.status === 200) {
        // 正常サインアウト：ログインへ
        router.push("/login")
        router.refresh()
        return
      }
      if (res.status === 401) {
        // 既に未ログイン：そのままログインへ
        router.push("/login")
        router.refresh()
        return
      }

      // 500 等はメッセージを表示
      const body = await res.json().catch(() => ({}))
      console.error("Logout failed:", body)
      alert("ログアウトに失敗しました。時間をおいて再度お試しください。")
    } catch (e) {
      console.error(e)
      alert("ネットワークエラーが発生しました。")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="hidden w-64 border-r border-blue-200 bg-linear-to-b from-white to-blue-50 md:block">
      <div className="flex h-full flex-col">
        <div className="gradient-primary shadow-soft flex h-16 items-center gap-2 px-6">
          <Receipt className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white">DocSnap</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "gradient-primary shadow-soft text-white"
                    : "hover:text-primary text-slate-700 hover:bg-blue-100",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-blue-200 p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="hover:text-primary w-full justify-start gap-3 border-blue-200 bg-transparent text-slate-700 hover:bg-blue-100"
          >
            <LogOut className="h-5 w-5" />
            {isLoggingOut ? "ログアウト中..." : "ログアウト"}
          </Button>
          <p className="text-xs text-slate-500">© 2025 DocSnap</p>
        </div>
      </div>
    </aside>
  )
}
