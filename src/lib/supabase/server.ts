// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Next の cookies() が Sync/Async どちらでも動くように吸収するヘルパ
 * - Next 14/15: cookies() は同期
 * - Next 16 の一部: cookies() は Promise
 */
async function getCookieStore() {
  const { cookies } = await import("next/headers")
  const maybe = cookies() as unknown
  // Promise なら await、同期ならそのまま返す
  if (maybe && typeof (maybe as Promise<unknown>).then === "function") {
    return (await maybe) as {
      get: (name: string) => { name: string; value: string } | undefined
      set: (name: string, value: string, options?: CookieOptions) => void
    }
  }
  return maybe as {
    get: (name: string) => { name: string; value: string } | undefined
    set: (name: string, value: string, options?: CookieOptions) => void
  }
}

/** 読み取り専用（Server Component など・cookie 書き込みは no-op） */
export async function createSupabaseServerClientReadonly(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key)
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")

  const cookieStore = await getCookieStore()

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        // no-op（Server Component からの書き込みは想定しない）
      },
      remove(_name: string, _options: CookieOptions) {
        // no-op
      },
    },
  })
}

/** Route Handler 等で cookie の set/remove が必要な場合はこちらを使用 */
export async function createSupabaseServerClientMutable(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key)
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")

  const cookieStore = await getCookieStore()

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // Server Component から誤って呼ばれた場合などは握りつぶす
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, expires: new Date(0) })
        } catch {
          // 同上
        }
      },
    },
  })
}
