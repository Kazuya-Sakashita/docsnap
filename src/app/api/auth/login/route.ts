// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClientMutable } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    // リクエストボディ検証
    const body = await req.json()
    const { email, password } = schema.parse(body)

    // Supabase 認証
    const supabase = await createSupabaseServerClientMutable()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user || !data.session) {
      return NextResponse.json({ ok: false, error: "Invalid login credentials" }, { status: 401 })
    }

    // Prisma 側に対応ユーザーが存在するか確認（なければログ出しのみ）
    try {
      const user = await prisma.user.findUnique({ where: { id: data.user.id } })
      if (!user) {
        console.warn("[auth/login] prisma.user not found for id:", data.user.id)
      }
    } catch (e) {
      // Prisma 側の一時的な失敗でログイン全体を落とさない
      console.error("[auth/login] prisma lookup error:", e)
    }

    // トークンを httpOnly クッキーへ保存
    // アクセストークンは約1時間で失効。expires_at は epoch 秒。
    const accessToken = data.session.access_token
    const refreshToken = data.session.refresh_token
    const expiresAtSec = data.session.expires_at ?? 0
    const nowSec = Math.floor(Date.now() / 1000)
    // maxAge は秒。失効までの残り時間を計算（最低30分は残す/なければ1時間でフォールバック）
    const accessMaxAge = Math.max(expiresAtSec - nowSec, 0) || 60 * 60

    const res = NextResponse.json({
      ok: true,
      // クライアントは /api/session を使う想定だが、
      // 便利のため最小限のユーザー情報は返しておく
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })

    // セキュア属性は本番で secure: true に
    const common = {
      httpOnly: true as const,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    }

    // アクセストークン（短命）
    res.cookies.set("sb-access-token", accessToken, {
      ...common,
      maxAge: accessMaxAge,
    })

    // リフレッシュトークン（より長命 / 30日を目安に）
    // Supabase のリフレッシュトークンはローテーションされるため、有効化している場合は
    // /api/session 側で 401 時にリフレッシュ動線を用意する想定です。
    res.cookies.set("sb-refresh-token", refreshToken, {
      ...common,
      maxAge: 60 * 60 * 24 * 30, // 30d
    })

    return res
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
    }
    console.error("[auth/login]", e)
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 })
  }
}
