// src/app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "600", "700"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DocSnap - レシート・領収書管理",
  description: "レシート・領収書を撮るだけで自動管理。個人の家計管理から法人の経費精算まで。",
  generator: "v0.app",
}

// ✅ CSSカスタムプロパティを許容する交差型（関数外に定義）
type RootCSSVars = React.CSSProperties & Record<"--font-noto-sans-jp", string>

// ✅ 毎回再生成しないように外で定義
const ROOT_STYLE: RootCSSVars = {
  ["--font-noto-sans-jp"]: [
    '"Noto Sans JP"',
    '"Hiragino Kaku Gothic ProN"',
    '"Hiragino Sans"',
    '"Yu Gothic UI"',
    '"Yu Gothic"',
    '"Meiryo"',
    "system-ui",
    "-apple-system",
    '"Segoe UI"',
    "Arial",
    "sans-serif",
  ].join(", "),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning style={ROOT_STYLE}>
      <head>
        {/* Google Fonts 経由で Noto Sans JP を配信（display=swap） */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
