// src/components/scan/processing-view.tsx
"use client"

import type { OcrMode } from "./types"
import { useMemo } from "react"
import { Loader2, Upload, ScanLine, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProcessingViewProps = {
  file: File | null
  mode: OcrMode
  /** 0〜100 */
  progress: number
}

type ProcessStep = "upload" | "ocr" | "analyze" | "save"

const steps: { id: ProcessStep; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "アップロード", icon: Upload },
  { id: "ocr", label: "OCR処理", icon: ScanLine },
  { id: "analyze", label: "解析", icon: ScanLine },
  { id: "save", label: "保存", icon: CheckCircle2 },
]

/** 進捗(0-100)から現在ステップのインデックスを決める */
function stepIndexFromProgress(p: number): number {
  if (p < 25) return 0 // upload
  if (p < 70) return 1 // ocr
  if (p < 90) return 2 // analyze
  return 3 // save
}

export function ProcessingView({ file, mode, progress }: ProcessingViewProps) {
  const clamped = Math.max(0, Math.min(100, progress))
  const activeIndex = stepIndexFromProgress(clamped)

  // 簡易ETA（ヒューリスティック）
  const estimatedTime = useMemo(() => Math.max(0, Math.ceil((100 - clamped) / 8)), [clamped])

  const handleCancel = () => {
    // 必要なら親にコールバックを生やして差し替え
    window.history.back()
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mb-1 text-xl font-bold text-balance">レシートを解析中</h2>
          <p className="text-muted-foreground text-xs">モード: {String(mode)}</p>
          <p className="text-muted-foreground mt-1 text-sm">残り約 {estimatedTime} 秒</p>
        </div>

        {/* ステップインジケーター */}
        <div className="relative flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === activeIndex
            const isCompleted = index < activeIndex

            return (
              <div key={step.id} className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    "mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    isActive || isCompleted
                      ? "text-foreground font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>

                {/* コネクタ線 */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-5 h-0.5 w-16 -translate-x-8",
                      index < activeIndex ? "bg-primary" : "bg-muted",
                    )}
                    style={{ left: `${(index + 1) * 25}%` }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* プログレスバー */}
        <div className="space-y-2">
          <Progress value={clamped} className="h-2" />
          <p className="text-muted-foreground text-center text-sm">{Math.round(clamped)}%</p>
        </div>

        {/* ファイル情報 */}
        {file && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        )}

        <Button variant="outline" className="w-full bg-transparent" onClick={handleCancel}>
          キャンセル
        </Button>
      </div>
    </div>
  )
}
