// src/app/api/_auth-helpers.ts
import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function required(name: string, v: string | undefined): string {
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

// Supabase の user_metadata 用の型（必要なフィールドだけ定義）
type SupabaseUserMetadata = {
  full_name?: string | null
}

// Next.js 15: cookies() は Promise
export async function getUserIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null

  const user = data.user
  const metadata = user.user_metadata as SupabaseUserMetadata | null | undefined

  const dbUser = await prisma.user.upsert({
    where: { supabaseUserId: user.id },
    update: {
      email: user.email ?? undefined,
      name: metadata?.full_name ?? undefined,
    },
    create: {
      supabaseUserId: user.id,
      email: user.email ?? "no-email@example.com",
      name: metadata?.full_name ?? null,
    },
  })

  return dbUser.id
}
