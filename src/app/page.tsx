// app/page.tsx  ← ホーム（/）をサーバー側でガード
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { AppLayout } from "@/components/app-layout"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const runtime = "nodejs"

export default async function HomePage() {
  const jar = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ★ 型に合わせて getAll / setAll を実装
        getAll() {
          return jar.getAll().map((c) => ({ name: c.name, value: c.value }))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/")
  }

  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  )
}
