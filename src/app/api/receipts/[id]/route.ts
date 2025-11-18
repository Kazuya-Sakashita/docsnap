// src/app/api/receipts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getUserIdFromSession } from "@/app/api/_auth-helpers"
import type { Receipt } from "@/types/receipt"
import { createSupabaseServiceClient } from "@/lib/supabase/server"

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  try {
    return JSON.stringify(err)
  } catch {
    return "unknown error"
  }
}

// Prisma の Receipt + 関連テーブルをまとめた型
type DbReceiptWithRelations = Prisma.ReceiptGetPayload<{
  include: {
    items: true
    files: true
  }
}>

// DB のレシート + items + files をフロント用の Receipt 型に変換
function mapDbReceiptToReceipt(dbReceipt: DbReceiptWithRelations): Receipt {
  // files[0].url を優先、なければ imageUrl を使う
  const primaryFile = dbReceipt.files?.[0]
  const imageUrl = primaryFile?.url ?? dbReceipt.imageUrl ?? undefined

  return {
    id: dbReceipt.id,
    userId: dbReceipt.userId,
    type: dbReceipt.type,
    title: dbReceipt.title || dbReceipt.storeName || "レシート",
    storeName: dbReceipt.storeName,
    purchaseDate:
      dbReceipt.purchaseDate instanceof Date
        ? dbReceipt.purchaseDate.toISOString()
        : (dbReceipt.purchaseDate as unknown as string),
    currency: dbReceipt.currency,
    subtotal: Number(dbReceipt.subtotal ?? 0),
    tax: Number(dbReceipt.tax ?? 0),
    total: Number(dbReceipt.total ?? 0),
    memo: dbReceipt.memo ?? "",
    status: dbReceipt.status,
    confidenceScore: dbReceipt.confidenceScore ?? undefined,
    imageUrl,

    // 品目一覧
    items: dbReceipt.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice != null ? Number(item.unitPrice) : 0,
      amount: item.amount != null ? Number(item.amount) : 0,
    })),

    // 添付ファイル一覧（Supabase Storage の画像など）
    files:
      dbReceipt.files?.map((f) => ({
        id: f.id,
        receiptId: f.receiptId,
        page: f.page,
        url: f.url,
        mimeType: f.mimeType,
        width: f.width,
        height: f.height,
        sha256: f.sha256,
        createdAt:
          f.createdAt instanceof Date
            ? f.createdAt.toISOString()
            : (f.createdAt as unknown as string),
        updatedAt:
          f.updatedAt instanceof Date
            ? f.updatedAt.toISOString()
            : (f.updatedAt as unknown as string),
      })) ?? [],

    categoryId: dbReceipt.categoryId ?? undefined,
    createdAt:
      dbReceipt.createdAt instanceof Date
        ? dbReceipt.createdAt.toISOString()
        : (dbReceipt.createdAt as unknown as string),
    updatedAt:
      dbReceipt.updatedAt instanceof Date
        ? dbReceipt.updatedAt.toISOString()
        : (dbReceipt.updatedAt as unknown as string),
    invoiceNumber: dbReceipt.invoiceNumber ?? undefined,
    recipientName: dbReceipt.recipientName ?? undefined,
    purpose: dbReceipt.purpose ?? undefined,
    registrationNumber: dbReceipt.registrationNumber ?? undefined,
    issuerAddress: dbReceipt.issuerAddress ?? undefined,
    paymentDueDate: dbReceipt.paymentDueDate
      ? dbReceipt.paymentDueDate instanceof Date
        ? dbReceipt.paymentDueDate.toISOString().slice(0, 10)
        : (dbReceipt.paymentDueDate as unknown as string)
      : undefined,
    paymentMethod: dbReceipt.paymentMethod ?? undefined,
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const dbReceipt = await prisma.receipt.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
        files: {
          // 1ページ目から順に並べる
          orderBy: { page: "asc" },
        },
      },
    })

    // 必要ならログを残してデバッグ
    console.log("[GET /api/receipts/[id]] dbReceipt:", {
      id: dbReceipt?.id,
      imageUrl: dbReceipt?.imageUrl,
      files: dbReceipt?.files?.map((f) => ({
        id: f.id,
        url: f.url,
        mimeType: f.mimeType,
      })),
    })

    if (!dbReceipt) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
    }

    const receipt = mapDbReceiptToReceipt(dbReceipt)
    return NextResponse.json({ ok: true, receipt })
  } catch (err) {
    console.error("[GET /api/receipts/[id]] error:", err)
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()
    const input: Receipt = (body.receipt ?? body) as Receipt

    const updatedDb = await prisma.$transaction(async (tx) => {
      // 自分のレシートか確認
      const existing = await tx.receipt.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
      })

      if (!existing) {
        throw new Error("not found")
      }

      // レシート本体を更新
      await tx.receipt.update({
        where: { id },
        data: {
          type: input.type,
          title: input.title,
          storeName: input.storeName,
          purchaseDate: new Date(input.purchaseDate),
          currency: input.currency,
          subtotal: input.subtotal,
          tax: input.tax,
          total: input.total,
          memo: input.memo ?? "",
          status: input.status,
          confidenceScore: input.confidenceScore ?? null,
          categoryId: input.categoryId ?? null,
          invoiceNumber: input.invoiceNumber ?? null,
          recipientName: input.recipientName ?? null,
          purpose: input.purpose ?? null,
          registrationNumber: input.registrationNumber ?? null,
          issuerAddress: input.issuerAddress ?? null,
          paymentDueDate: input.paymentDueDate
            ? new Date(input.paymentDueDate)
            : null,
          paymentMethod: input.paymentMethod ?? null,
          updatedAt: new Date(),
        },
      })

      // ── 明細行（items）を更新 ──
      await tx.receiptItem.deleteMany({
        where: { receiptId: id },
      })

      if (input.items && input.items.length > 0) {
        await tx.receiptItem.createMany({
          data: input.items.map((item) => ({
            receiptId: id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice ?? 0,
            amount: item.amount ?? 0,
            taxRate:
              existing.taxRate != null ? Number(existing.taxRate) : null,
            rawLine: null,
          })),
        })
      }

      // 更新後のレシート＋items＋files を取り直す
      const updated = await tx.receipt.findFirst({
        where: {
          id,
          userId,
          deletedAt: null,
        },
        include: {
          items: true,
          files: {
            orderBy: { page: "asc" },
          },
        },
      })

      if (!updated) {
        throw new Error("updated receipt not found")
      }

      return updated
    })

    const receipt = mapDbReceiptToReceipt(updatedDb)
    return NextResponse.json({ ok: true, receipt })
  } catch (err) {
    console.error("[PUT /api/receipts/[id]] error:", err)

    if (getErrorMessage(err) === "not found") {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status: 500 })
  }
}

// ===== ここから DELETE: レシート削除 + Supabase Storage 画像削除 =====

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // 1) 自分のレシートか確認しつつ、紐づく files を取得
    const receipt = await prisma.receipt.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        files: true,
      },
    })

    if (!receipt) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
    }

    // 2) Storage の key を URL から抽出
    //    Supabase の public URL は
    //    https://<project>.supabase.co/storage/v1/object/public/receipts/<path>
    //    という形なので、`/receipts/` 以降を key とする
    const storageKeys = receipt.files
      .map((f) => {
        try {
          const url = new URL(f.url)
          const marker = "/receipts/"
          const idx = url.pathname.indexOf(marker)
          if (idx === -1) return null
          // 例: "<user-id>/1234567890.png"
          return url.pathname.slice(idx + marker.length)
        } catch {
          return null
        }
      })
      .filter((k): k is string => !!k)

    // 3) DB のレシート削除（ReceiptFile は ON DELETE CASCADE で一緒に削除される想定）
    await prisma.receipt.delete({
      where: { id: receipt.id },
    })

    // 4) Supabase Storage からも画像削除（ベストエフォート）
    if (storageKeys.length > 0) {
      try {
        const supabase = createSupabaseServiceClient()
        const { error: storageError } = await supabase.storage
          .from("receipts")
          .remove(storageKeys)

        if (storageError) {
          console.error(
            "[DELETE /api/receipts/[id]] storage remove error:",
            storageError,
          )
        }
      } catch (e) {
        console.error("[DELETE /api/receipts/[id]] storage remove thrown:", e)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/receipts/[id]] error:", err)
    return NextResponse.json(
      { ok: false, error: getErrorMessage(err) },
      { status: 500 },
    )
  }
}
