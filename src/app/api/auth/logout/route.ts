// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST() {
  try {
    const reqCookies = await cookies()
    // ★ 先にレスポンスを作る（ここに Set-Cookie を積む）
    const res = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return reqCookies.getAll().map((c) => ({ name: c.name, value: c.value }))
          },
          setAll(list: { name: string; value: string; options: CookieOptions }[]) {
            // ★ Set-Cookie は必ず「res.cookies」に書く
            for (const { name, value, options } of list) {
              res.cookies.set({ name, value, ...options })
            }
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase.auth.signOut()
    if (error) return NextResponse.json({ ok: false, error: "Failed to sign out" }, { status: 500 })

    // 予防線：名称衝突や Path の違いで残ってしまった場合に手動で潰す
    for (const name of ["sb-access-token", "sb-refresh-token"]) {
      res.cookies.set({ name, value: "", path: "/", maxAge: 0 })
    }

    return res
  } catch (e) {
    console.error("POST /api/auth/logout error", e)
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 })
  }
}
