// src/app/api/receipts/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("[GET /api/receipts] auth error:", error)
      return NextResponse.json({ error: "認証エラー" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "未ログインです" }, { status: 401 })
    }

    console.log("[GET /api/receipts] supabase user.id:", user.id)

    // ① Supabase の user.id → アプリ側 User を取得
    const appUser = await prisma.user.findUnique({
      where: {
        supabaseUserId: user.id, // ★ このスキーマにピッタリ
      },
    })

    if (!appUser) {
      console.warn(
        "[GET /api/receipts] app user not found for supabaseUserId:",
        user.id,
      )
      // まだ User レコードが作られていない場合など
      return NextResponse.json([], { status: 200 })
    }

    console.log("[GET /api/receipts] app user.id:", appUser.id)

    // ② Receipt.userId は「アプリ側 User.id」
    const receipts = await prisma.receipt.findMany({
      where: {
        userId: appUser.id,
        deletedAt: null, // 論理削除を除外したい場合
      },
      orderBy: { purchaseDate: "desc" },
      include: {
        items: true,
        // files: true, // 必要なら
      },
    })

    console.log("[GET /api/receipts] raw count:", receipts.length)

    // ③ Decimal → number に変換してから返す（フロントの Receipt 型に合わせる）
  const serialized = receipts.map((r) => ({
    ...r,
    subtotal: Number(r.subtotal),
    tax: Number(r.tax),
    total: Number(r.total),
    taxRate: r.taxRate != null ? Number(r.taxRate) : null,
    // ★ status が null の場合は READY にフォールバック
    status: r.status ?? "READY",
  }))

    console.log(
      "[GET /api/receipts] sample:",
      JSON.stringify(serialized.slice(0, 3), null, 2),
    )

    return NextResponse.json(serialized, { status: 200 })
  } catch (e) {
    console.error("[GET /api/receipts] unexpected error:", e)
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 })
  }
}
