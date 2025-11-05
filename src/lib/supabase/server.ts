// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // App Router では set/remove を多くの場合使いません。必要なければ no-op でOK。
        set(name: string, value: string, options: CookieOptions) {
          // もしRoute Handler内などでクッキーを書きたい場合のみ有効化
          // cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // cookieStore.set({ name, value: '', ...options, expires: new Date(0) })
        },
      },
    }
  )
}
