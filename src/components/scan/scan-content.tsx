"use client"

import { useState } from "react"
import { UploadView } from "./upload-view"
import { ProcessingView } from "./processing-view"
import { CompletionView } from "./completion-view"

type ScanStep = "upload" | "processing" | "complete"

export function ScanContent() {
  const [step, setStep] = useState<ScanStep>("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [receiptId, setReceiptId] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    setStep("processing")

    // ダミーの処理: 3秒後に完了
    setTimeout(() => {
      setReceiptId("receipt-123")
      setStep("complete")
    }, 3000)
  }

  const handleStartOver = () => {
    setStep("upload")
    setUploadedFile(null)
    setReceiptId(null)
  }

  if (step === "processing") {
    return <ProcessingView file={uploadedFile} />
  }

  if (step === "complete" && receiptId) {
    return <CompletionView receiptId={receiptId} onStartOver={handleStartOver} />
  }

  return <UploadView onFileSelect={handleFileSelect} />
}
