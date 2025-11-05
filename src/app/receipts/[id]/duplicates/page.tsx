import { AppLayout } from "@/components/app-layout"
import { DuplicateComparisonContent } from "@/components/receipts/duplicate-comparison-content"

export default function DuplicatesPage({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <DuplicateComparisonContent receiptId={params.id} />
    </AppLayout>
  )
}
