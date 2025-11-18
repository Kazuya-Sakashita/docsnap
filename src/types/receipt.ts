// src/types/receipt.ts
import type { $Enums } from "@prisma/client"

// Prisma 側の enum をそのまま利用
export type ReceiptStatus = $Enums.ReceiptStatus
export type ReceiptType = $Enums.ReceiptType
export type Currency = $Enums.Currency
export type PaymentMethod = $Enums.PaymentMethod

export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  amount: number
}

// Storage に保存されたレシート画像 1 件分
export interface ReceiptFile {
  id: string
  receiptId: string
  page: number | null
  url: string
  mimeType: string | null
  width: number | null
  height: number | null
  sha256: string | null
  createdAt: string
  updatedAt: string
}

export interface Receipt {
  id: string
  userId: string

  // 種別（レシート / 請求書）
  type: ReceiptType

  // タイトル（UI 用の表示名。storeName と別に持つ）
  title: string

  // 店名・発行元
  storeName: string

  // 購入日 / 発行日（ISO 文字列 or YYYY-MM-DD）
  purchaseDate: string

  // 通貨は Prisma の enum に合わせる
  currency: Currency

  // 金額まわり（フロントでは number で扱う）
  subtotal: number
  tax: number
  total: number

  // 任意のメモ
  memo?: string

  // ステータス（DRAFT を含めて Prisma の enum と同一）
  status: ReceiptStatus

  // OCR の信頼度（0〜1）
  confidenceScore?: number

  // 既存の単一画像 URL（必要ならそのまま併用）
  imageUrl?: string

  // 品目一覧
  items: ReceiptItem[]

  // 添付ファイル一覧（Supabase Storage の画像など）
  files?: ReceiptFile[]

  // カテゴリ ID（任意）
  categoryId?: string

  // 作成・更新日時（ISO 文字列）
  createdAt: string
  updatedAt: string

  // インボイス系フィールド（INVOICE タイプなどで使用）
  invoiceNumber?: string
  recipientName?: string
  purpose?: string
  registrationNumber?: string
  issuerAddress?: string
  paymentDueDate?: string
  paymentMethod?: PaymentMethod
}

export interface Category {
  id: string
  userId: string
  name: string
  color?: string
  usageCount: number
  createdAt: string
  updatedAt: string
}
