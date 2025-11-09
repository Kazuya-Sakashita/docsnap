// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { prisma } from "@/server/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const jar = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return jar.getAll().map((c) => ({ name: c.name, value: c.value }))
          },
          setAll(list: { name: string; value: string; options: CookieOptions }[]) {
            for (const { name, value, options } of list) jar.set({ name, value, ...options })
          },
        },
      },
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    // ★ ここを upsert に変更（存在しなければ作成、あれば更新）
    const dbUser = await prisma.user.upsert({
      where: { supabaseUserId: user.id },
      update: {
        email: user.email ?? undefined,
        // 必要ならメタデータ反映（存在しない項目はコメントアウトのままでOK）
        // name: (user.user_metadata as any)?.name ?? undefined,
        // companyName: ...,
      },
      create: {
        supabaseUserId: user.id,
        email: user.email ?? "",
        // name: (user.user_metadata as any)?.name ?? null,
        // accountType: "PERSONAL", // 既定を変えたい場合
      },
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        name: true,
        accountType: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ ok: true, user: dbUser }, { status: 200 })
  } catch (e) {
    console.error("GET /api/auth/me error", e)
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 })
  }
}
