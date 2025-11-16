// src/app/receipts/[id]/page.tsx
import { AppLayout } from "@/components/app-layout"
import { ReceiptDetailContent } from "@/components/receipts/receipt-detail-content"

type PageProps = {
  // Next.js 15 では params が Promise になる
  params: Promise<{ id: string }>
}

export default async function ReceiptDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <AppLayout>
      <ReceiptDetailContent receiptId={id} />
    </AppLayout>
  )
}
