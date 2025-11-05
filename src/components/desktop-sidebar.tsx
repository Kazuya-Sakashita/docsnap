"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ScanLine, List, Settings, Receipt, FolderOpen, Download } from "lucide-react"
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

  return (
    <aside className="hidden w-64 border-r border-blue-200 bg-gradient-to-b from-white to-blue-50 md:block">
      <div className="flex h-full flex-col">
        <div className="gradient-primary flex h-16 items-center gap-2 px-6 shadow-soft">
          <Receipt className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white">DocSnap</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "gradient-primary text-white shadow-soft"
                    : "text-slate-700 hover:bg-blue-100 hover:text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-blue-200 p-4">
          <p className="text-xs text-slate-500">© 2025 DocSnap</p>
        </div>
      </div>
    </aside>
  )
}
