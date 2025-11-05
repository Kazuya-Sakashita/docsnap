"use client"

import { useEffect, useState } from "react"
import { Loader2, Upload, ScanLine, CheckCircle2, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProcessingViewProps {
  file: File | null
}

type ProcessStep = "upload" | "ocr" | "analyze" | "save"

const steps: { id: ProcessStep; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "アップロード", icon: Upload },
  { id: "ocr", label: "OCR処理", icon: ScanLine },
  { id: "analyze", label: "解析", icon: ScanLine },
  { id: "save", label: "保存", icon: CheckCircle2 },
]

export function ProcessingView({ file }: ProcessingViewProps) {
  const [currentStep, setCurrentStep] = useState<ProcessStep>("upload")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState(3)

  useEffect(() => {
    // ダミーの進行シミュレーション
    const stepDurations = {
      upload: 500,
      ocr: 1500,
      analyze: 800,
      save: 200,
    }

    let currentProgress = 0
    const totalDuration = Object.values(stepDurations).reduce((a, b) => a + b, 0)

    const interval = setInterval(() => {
      currentProgress += 1
      setProgress(Math.min((currentProgress / totalDuration) * 100, 100))
      setEstimatedTime(Math.max(Math.ceil((totalDuration - currentProgress) / 1000), 0))

      // ステップ遷移
      if (currentProgress === stepDurations.upload) {
        setCurrentStep("ocr")
      } else if (currentProgress === stepDurations.upload + stepDurations.ocr) {
        setCurrentStep("analyze")
      } else if (currentProgress === stepDurations.upload + stepDurations.ocr + stepDurations.analyze) {
        setCurrentStep("save")
      }
    }, 10)

    return () => clearInterval(interval)
  }, [])

  const handleCancel = () => {
    // TODO: 実際のキャンセル処理
    window.history.back()
  }

  const handleRetry = () => {
    setError(null)
    setCurrentStep("upload")
    setProgress(0)
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <h2 className="text-balance mb-2 text-xl font-bold">解析に失敗しました</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Alert>
            <AlertDescription>
              <p className="mb-2 font-medium">解決方法:</p>
              <ul className="space-y-1 text-left text-sm">
                <li>• 明るい場所で再度撮影してください</li>
                <li>• レシート全体が写っているか確認してください</li>
                <li>• ピントが合っているか確認してください</li>
              </ul>
            </AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancel}>
              キャンセル
            </Button>
            <Button className="flex-1" onClick={handleRetry}>
              再試行
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-balance mb-2 text-xl font-bold">レシートを解析中</h2>
          <p className="text-sm text-muted-foreground">残り約 {estimatedTime} 秒</p>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

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
                  {isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    isActive || isCompleted ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={cn("absolute mt-5 h-0.5 w-16 -translate-x-8", isCompleted ? "bg-primary" : "bg-muted")}
                    style={{ left: `${(index + 1) * 25}%` }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* プログレスバー */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </div>

        {/* ファイル情報 */}
        {file && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        )}

        <Button variant="outline" className="w-full bg-transparent" onClick={handleCancel}>
          キャンセル
        </Button>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
