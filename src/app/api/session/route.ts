// src/app/api/session/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export const runtime = "nodejs" // PrismaやNode APIを使うのでNode runtimeを明示
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const cookieStore = await cookies()

  // ※ Service Roleキーは使わない。必ず anon key を使う
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // cookie を削除する慣用パターン
          cookieStore.set({ name, value: "", ...options, maxAge: 0 })
        },
      },
    },
  )

  // ★ accessToken を手動で読む必要はない。自動でcookieから読まれ、必要ならrefreshされる
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // ★ 未ログインでも200で返す
  return NextResponse.json(
    { user: user ? { id: user.id, email: user.email } : null },
    { status: 200 },
  )
}
