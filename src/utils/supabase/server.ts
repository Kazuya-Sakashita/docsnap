// src/utils/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServerClient() {
  // ★ Next.js 15/16 では cookies() を await する
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // プロジェクトで使っている方に合わせる
    {
      cookies: {
        // 既存の Cookie を Supabase に渡す
        getAll() {
          return cookieStore.getAll()
        },
        // Supabase 側で Cookie 更新が走ったときに反映する
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component 経由などで set が呼ばれた場合は無視で OK
          }
        },
      },
    }
  )
}
