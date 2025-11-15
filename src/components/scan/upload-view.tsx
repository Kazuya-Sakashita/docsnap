// src/components/scan/upload-view.tsx
"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Upload, Camera, ImageIcon, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { OcrMode } from "./types"

export interface UploadViewProps {
  /** 初期モード */
  defaultMode: OcrMode
  /** 利用可能なモード一覧（未指定なら defaultMode のみ） */
  modes?: readonly OcrMode[]
  /** ファイル選択時に呼ばれる（現在のモードも渡す） */
  onFileSelect: (file: File, selectedMode: OcrMode) => void | Promise<void>
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]

// 任意: モード名の表示ラベル（存在しないキーはフォールバック）
const modeLabelMap: Partial<Record<OcrMode, string>> = {
  document: "ドキュメント",
  // receipt: "レシート", // OcrMode に存在する場合だけ有効
}

// 任意: モード別アイコン（存在しないキーは FileText にフォールバック）
const modeIconMap: Partial<Record<OcrMode, React.ComponentType<{ className?: string }>>> = {
  document: FileText,
  // receipt: Receipt,
}

export function UploadView({ defaultMode, modes, onFileSelect }: UploadViewProps) {
  const availableModes = (modes && modes.length > 0 ? modes : [defaultMode]) as readonly OcrMode[]
  const [mode, setMode] = useState<OcrMode>(defaultMode)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("JPG、PNG、PDF形式のファイルのみ対応しています")
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズは10MB以下にしてください")
      return false
    }
    return true
  }, [])

  const handleSelected = useCallback(
    (file: File) => {
      if (!validateFile(file)) return
      setError("")
      void onFileSelect(file, mode)
    },
    [mode, onFileSelect, validateFile],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleSelected(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleSelected(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-balance text-slate-900 md:text-3xl">
            レシートをスキャン
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            レシートを撮影またはアップロードしてください
          </p>
        </div>

        {/* モード切替（availableModes を描画） */}
        {availableModes.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {availableModes.map((m) => {
              const Label = modeLabelMap[m] ?? String(m)
              const Icon = modeIconMap[m] ?? FileText
              const active = mode === m
              return (
                <Button
                  key={m}
                  type="button"
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "rounded-full",
                    active ? "gradient-primary hover:opacity-90" : "bg-transparent",
                  )}
                  onClick={() => setMode(m)}
                  aria-pressed={active}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {Label}
                </Button>
              )
            })}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* モバイル: カメラボタン優先 */}
        <div className="space-y-4 md:hidden">
          <Button
            size="lg"
            className="tap-target gradient-primary w-full hover:opacity-90"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="mr-2 h-5 w-5" />
            カメラで撮影
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            size="lg"
            variant="outline"
            className="tap-target w-full bg-transparent"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mr-2 h-5 w-5" />
            アルバムから選択
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* デスクトップ: ドラッグ&ドロップ */}
        <div className="hidden md:block">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-blue-200 bg-blue-50/30",
            )}
          >
            <Upload className="text-primary mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              ファイルをドラッグ&ドロップ
            </h3>
            <p className="mb-6 text-sm text-slate-600">または</p>
            <Button
              size="lg"
              className="gradient-primary hover:opacity-90"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="mr-2 h-5 w-5" />
              ファイルを選択
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <h4 className="mb-2 font-medium text-slate-900">撮影のコツ</h4>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• 明るい場所で撮影してください</li>
            <li>• レシート全体が写るように撮影してください</li>
            <li>• 斜めにならないよう正面から撮影してください</li>
            <li>• ピントが合っていることを確認してください</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">対応形式: JPG、PNG、PDF（最大10MB）</p>
        </div>
      </div>
    </div>
  )
}
