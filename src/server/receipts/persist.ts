// src/server/receipts/persist.ts
import { PrismaClient, Prisma } from "@prisma/client"
import crypto from "crypto"
import type { NormalizedReceipt } from "@/components/receipt/types"

const prisma = new PrismaClient()

export type PersistInput = {
  userId: string
  normalized: NormalizedReceipt
  rawOcrText: string
  files?: Array<{
    url: string
    mimeType?: string
    width?: number
    height?: number
    sha256?: string
  }>
  ocrEngine?: "TESSERACT" | "GOOGLE_DOC_AI" | "AWS_TEXTRACT" | "AZURE_FORM_RECOGNIZER" | "OTHER"
  parser?: string
  parseVersion?: string
  taxBreakdown?: Record<string, unknown> | null

  // 呼び出し側から保存時のステータスを指定できる（DRAFT / READY / ERROR など）
  status?: Prisma.ReceiptCreateInput["status"]
}

/** テキストベース重複指紋（画像指紋と併用推奨） */
export function textFingerprint(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim()
  return crypto.createHash("sha256").update(compact).digest("hex")
}

export async function persistReceipt(input: PersistInput) {
  const {
    userId,
    normalized,
    rawOcrText,
    files = [],
    ocrEngine = "OTHER",
    parser,
    parseVersion,
    taxBreakdown,
    status = "DRAFT", // 呼び出し側から指定がなければ DRAFT
  } = input

  const fp = textFingerprint(rawOcrText)

  // 既存重複チェック（user単位）
  const dup = await prisma.receipt.findFirst({
    where: { userId, fingerprint: fp },
    select: { id: true, status: true },
  })

  // ========== 既存レシートがある場合はそれを再利用 ==========
  if (dup) {
    console.log("[PERSIST] duplicate detected, reusing receipt:", {
      id: dup.id,
      currentStatus: dup.status,
    })

    const updated = await prisma.receipt.update({
      where: { id: dup.id },
      data: {
        // 重複扱いにしたい場合
        status: "DUPLICATE",

        // 解析メタは最新で上書きしておく
        rawOcrText,
        normalizedJson: JSON.parse(JSON.stringify(normalized)) as Prisma.InputJsonValue,
        taxBreakdownJson:
          taxBreakdown === null
            ? Prisma.JsonNull
            : (taxBreakdown as Prisma.InputJsonValue | undefined),
        parser: parser ?? normalized.meta?.parser ?? null,
        parseVersion: parseVersion ?? null,
        ocrEngine,
      },
      include: { items: true, files: true },
    })

    return updated
  }

  // ========== 新規レシート作成フロー ==========

  const base = normalized

  // totals は null 許容の正規化型を想定 → 未確定時は 0 フォールバック
  const subtotal = Number(base.totals.subtotal10 ?? 0) + Number(base.totals.subtotal8 ?? 0)
  const tax = Number(base.totals.tax10 ?? 0) + Number(base.totals.tax8 ?? 0)
  const total = Number(base.totals.grandTotal ?? subtotal + tax)

  // 呼び出し側からの status（DRAFT など）をそのまま使用
  const effectiveStatus: Prisma.ReceiptCreateInput["status"] = status

  // items を事前に組み立ててログもしやすくする
  const itemsForCreate = base.items.map((it, index) => {
    if (!it.name) {
      console.warn("[PERSIST] item without name:", {
        index,
        raw: it.raw,
        total: it.total,
        qty: it.qty,
      })
    }

    return {
      // デバッグしやすいよう、name が空なら raw も使う
      name: it.name || it.raw || "不明な品目",
      quantity: it.qty ?? 1,
      unitPrice: it.unitPrice ?? (it.total && it.qty ? Math.round(it.total / it.qty) : undefined),
      amount: it.total ?? undefined,
      taxRate: it.taxRate ?? undefined,
      rawLine: it.raw ?? undefined,
    }
  })

  console.log("[PERSIST] creating receipt:", {
    userId,
    status: effectiveStatus,
    storeName: base.merchant.name,
    purchasedAt: base.purchasedAt,
    totals: {
      subtotal,
      tax,
      total,
    },
    itemsCount: itemsForCreate.length,
  })

  const receipt = await prisma.receipt.create({
    data: {
      userId,
      type: "RECEIPT",
      title: base.merchant.name ?? "レシート",
      storeName: base.merchant.name ?? "不明",
      purchaseDate: base.purchasedAt ? new Date(base.purchasedAt) : new Date(),
      currency: "JPY",
      subtotal,
      tax,
      total,
      memo: null,
      status: effectiveStatus,

      // 解析メタ
      rawOcrText,
      normalizedJson: JSON.parse(JSON.stringify(base)) as Prisma.InputJsonValue,
      taxBreakdownJson:
        taxBreakdown === null
          ? Prisma.JsonNull
          : (taxBreakdown as Prisma.InputJsonValue | undefined),
      parser: parser ?? base.meta?.parser ?? null,
      parseVersion: parseVersion ?? null,
      ocrEngine,
      fingerprint: fp,
      isDuplicateOfId: null, // 新規なので null

      // 明細
      items: {
        create: itemsForCreate,
      },

      // 画像/ファイル
      files: files.length
        ? {
            create: files.map((f, idx) => ({
              page: idx + 1,
              url: f.url,
              mimeType: f.mimeType ?? undefined,
              width: f.width ?? undefined,
              height: f.height ?? undefined,
              sha256: f.sha256 ?? undefined,
            })),
          }
        : undefined,
    },
    include: { items: true, files: true },
  })

  console.log("[PERSIST] created receipt id:", receipt.id)

  return receipt
}
