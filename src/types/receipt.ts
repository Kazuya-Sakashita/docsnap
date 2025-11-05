export type ReceiptStatus = "READY" | "PROCESSING" | "ERROR" | "DUPLICATE"
export type ReceiptType = "RECEIPT" | "INVOICE"

export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Receipt {
  id: string
  userId: string
  type: ReceiptType
  title: string
  storeName: string
  purchaseDate: string
  currency: string
  subtotal: number
  tax: number
  total: number
  memo?: string
  status: ReceiptStatus
  confidenceScore?: number
  imageUrl?: string
  items: ReceiptItem[]
  categoryId?: string
  createdAt: string
  updatedAt: string
  invoiceNumber?: string
  recipientName?: string
  purpose?: string
  registrationNumber?: string
  issuerAddress?: string
  paymentDueDate?: string
  paymentMethod?: string
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
