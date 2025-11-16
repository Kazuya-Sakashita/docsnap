// src/app/api/receipts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getUserIdFromSession } from "@/app/api/_auth-helpers"
import type { Receipt } from "@/types/receipt"

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
  const imageUrl = dbReceipt.imageUrl ?? dbReceipt.files?.[0]?.url ?? undefined

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
    items: dbReceipt.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice != null ? Number(item.unitPrice) : 0,
      amount: item.amount != null ? Number(item.amount) : 0,
    })),
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
        files: true,
      },
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
            // Decimal → number に変換してから渡す
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
          files: true,
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
