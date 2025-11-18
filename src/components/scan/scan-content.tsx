// src/components/scan/scan-content.tsx
"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { UploadView } from "./upload-view"
import { ProcessingView } from "./processing-view"
import { CompletionView } from "./completion-view"
import type { OcrMode, OcrResponse } from "./types"
import { runOcr } from "@/lib/ocr"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"

// ===== ヘルパー型（any排除のための最小想定） =====
type MinimalTotals = { grandTotal?: number | string | null }
type MinimalMerchant = { name?: string | null }
type MinimalNormalized = {
  merchant?: MinimalMerchant | null
  purchasedAt?: string | null
  totals?: MinimalTotals | null
}

type MinimalExtracted = {
  storeName?: string | null
  purchaseDate?: string | null
  total?: number | null
}

// OCR結果の薄いビュー
type OcrResultShallow = OcrResponse & {
  normalized?: MinimalNormalized | null
  receipt?: MinimalNormalized | null
  receiptId?: string
  saved?: { id: string }
  extracted?: MinimalExtracted
}

// OCRレスポンスに「テキスト系のフィールド」があることを表す補助型
type OcrWithText = OcrResponse & {
  rawOcrText?: string
  text?: string
}

// /api/ocr が返してくる image を表す補助型
type OcrImage = {
  url?: string | null
  path?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  sha256?: string | null
  page?: number | null
}

type ScanStep = "upload" | "processing" | "complete" | "error"

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  try {
    return JSON.stringify(err)
  } catch {
    return "不明なエラーが発生しました"
  }
}

// grandTotal を number に正規化
function toNumberOrZero(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v.replace(/[,，]/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function extractNormalized(res: OcrResultShallow): MinimalNormalized {
  return res.normalized ?? res.receipt ?? {}
}

function extractSummary(res: OcrResultShallow) {
  const n = extractNormalized(res)
  const e = res.extracted ?? {}

  return {
    storeName: e.storeName || n.merchant?.name || "不明",
    purchaseDate: e.purchaseDate || n.purchasedAt || new Date().toISOString(),
    total: e.total ?? toNumberOrZero(n.totals?.grandTotal),
    status: "READY" as const,
  }
}

function extractReceiptId(res: OcrResultShallow): string {
  return res.receiptId ?? res.saved?.id ?? "preview"
}

export function ScanContent() {
  const [step, setStep] = useState<ScanStep>("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [mode, setMode] = useState<OcrMode>("receipt") // OcrMode にある値を初期値に

  // CompletionView 用に OCR 結果を保持
  const [ocrResult, setOcrResult] = useState<OcrResultShallow | null>(null)
  const [error, setError] = useState<string>("")

  // 疑似プログレス
  const [progress, setProgress] = useState<number>(0)
  const timerRef = useRef<number | null>(null)

  const startProgress = useCallback(() => {
    setProgress(8)
    timerRef.current = window.setInterval(() => {
      setProgress((p) => (p < 92 ? p + Math.max(1, Math.floor((100 - p) / 20)) : p))
    }, 120)
  }, [])

  const stopProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setProgress(100)
  }, [])

  const handleFileSelect = useCallback(
    async (file: File, selectedMode: OcrMode) => {
      setUploadedFile(file)
      setMode(selectedMode)
      setError("")
      setStep("processing")
      startProgress()

      try {
        // 1. OCR 実行
        const ocr = await runOcr(file, selectedMode)

        // 2. OCR結果からテキストと extracted / image を取り出す
        const withText: OcrWithText & { image?: OcrImage } = ocr as OcrWithText & {
          image?: OcrImage
        }
        const shallowFromOcr: OcrResultShallow & { image?: OcrImage } =
          ocr as OcrResultShallow & { image?: OcrImage }

        const rawOcrText = withText.rawOcrText ?? withText.text ?? ""

        // /api/ocr のレスポンスの image を Import 用に整形
        const imageForImport =
          withText.image?.url != null
            ? {
                url: withText.image.url,
                mimeType: withText.image.mimeType ?? file.type ?? "image/png",
                width: withText.image.width ?? undefined,
                height: withText.image.height ?? undefined,
                sha256: withText.image.sha256 ?? undefined,
                page: withText.image.page ?? 1,
              }
            : undefined

        console.log("[ScanContent] imageForImport:", imageForImport)

        // 3. /api/receipts/import に POST（ドラフトとして保存）
        const res = await fetch("/api/receipts/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawOcrText,
            extracted: shallowFromOcr.extracted, // OCR 側で計算したサマリ
            image: imageForImport, // ★ ここで /api/ocr の image をそのまま渡す
            // 必要に応じて ocrEngine, parser なども追加可能
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? "レシートの保存に失敗しました")
        }

        const data = await res.json()
        const receipt = data.receipt as { id: string }

        // 4. OCR結果 + 保存済みレシートID をまとめて state に載せる
        const shallowForState: OcrResultShallow = {
          ...shallowFromOcr,
          saved: { id: receipt.id },
          receiptId: receipt.id,
        }

        stopProgress()
        setOcrResult(shallowForState)
        setStep("complete")
        // 実際の遷移は CompletionView 側の「詳細を確認」ボタンで行う想定
      } catch (err) {
        stopProgress()
        setError(getErrorMessage(err))
        setStep("error")
      }
    },
    [startProgress, stopProgress],
  )

  const handleStartOver = useCallback(() => {
    setStep("upload")
    setUploadedFile(null)
    setOcrResult(null)
    setError("")
    setProgress(0)
  }, [])

  const originalName = useMemo(() => uploadedFile?.name ?? "未選択", [uploadedFile])

  if (step === "processing") {
    return <ProcessingView file={uploadedFile} mode={mode} progress={progress} />
  }

  if (step === "complete" && ocrResult) {
    const summary = extractSummary(ocrResult)
    const receiptId = extractReceiptId(ocrResult)

    return <CompletionView receiptId={receiptId} summary={summary} onStartOver={handleStartOver} />
  }

  if (step === "error") {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>解析に失敗しました</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="mb-2 text-sm">ファイル: {originalName}</div>
              <div className="text-sm">{error || "エラーが発生しました"}</div>
              <ul className="mt-3 list-disc pl-5 text-sm">
                <li>明るい場所で再撮影してください</li>
                <li>レシート全体が写っているか確認してください</li>
                <li>ピントが合っているか確認してください</li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => history.back()}
            >
              キャンセル
            </Button>
            <Button className="flex-1" onClick={handleStartOver}>
              再試行
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <UploadView onFileSelect={handleFileSelect} defaultMode={mode} />
}
