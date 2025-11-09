// middleware.ts（プロジェクト直下）
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "./src/utils/supabase/middleware"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // --- 除外ルート（ここでは何もしない） ---
  if (
    pathname.startsWith("/api/") || // API は除外（特に /api/auth/logout）
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  // --- 保護対象を定義：ホーム（/）と /dashboard 配下 ---
  const isProtected = pathname === "/" || pathname.startsWith("/dashboard")
  if (!isProtected) {
    return NextResponse.next()
  }

  // --- ここで初めて refresh & Cookie 同期（期限切れなら更新） ---
  const response = await updateSession(request)

  // --- 認証確認（Edge対応のまま） ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options: CookieOptions) => {
          // Set-Cookie を「response」に積む（ブラウザへ返すため）
          response.cookies.set({ name, value, ...options })
          // request 側も同期（任意。無くても可）
          request.cookies.set(name, value)
        },
        remove: (name, options: CookieOptions) => {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 })
          request.cookies.set(name, "")
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }

  return response
}

// ホーム "/" とダッシュボード配下のみ対象
export const config = {
  matcher: ["/", "/dashboard/:path*"],
}
