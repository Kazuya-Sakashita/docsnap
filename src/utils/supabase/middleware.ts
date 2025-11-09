// src/utils/supabase/middleware.ts
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

/**
 * ミドルウェア先頭で呼び出して、トークンの自動更新と Cookie 同期を行う。
 * - 返り値の NextResponse を以後使い回す（set/remove が反映される）
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ← 公開可能な ANON(PUBLISHABLE) KEY を使う
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // ブラウザに返す Cookie と、以降の処理で参照する request 側を両方更新
          response.cookies.set({ name, value, ...options })
          request.cookies.set(name, value)
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 })
          request.cookies.set(name, "")
        },
      },
    },
  )

  // ここで getUser() を呼ぶと、期限切れなら refresh が走り Cookie が更新される
  await supabase.auth.getUser()

  return response
}
