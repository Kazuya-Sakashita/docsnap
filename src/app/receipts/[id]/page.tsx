import { AppLayout } from "@/components/app-layout"
import { ReceiptDetailContent } from "@/components/receipts/receipt-detail-content"

export default function ReceiptDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <ReceiptDetailContent receiptId={params.id} />
    </AppLayout>
  )
}
