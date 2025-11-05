import type React from "react"
import { MobileNav } from "./mobile-nav"
import { DesktopSidebar } from "./desktop-sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DesktopSidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-bg pb-20 md:pb-0">{children}</main>

      <MobileNav />
    </div>
  )
}
