"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ScanLine, List, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/scan", label: "スキャン", icon: ScanLine },
  { href: "/receipts", label: "一覧", icon: List },
  { href: "/settings", label: "設定", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-200 bg-white/95 backdrop-blur-md shadow-soft-lg md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "tap-target flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-slate-600 hover:text-primary",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
