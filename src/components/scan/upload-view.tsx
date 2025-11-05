"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Camera, ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface UploadViewProps {
  onFileSelect: (file: File) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]

export function UploadView({ onFileSelect }: UploadViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("JPG、PNG、PDF形式のファイルのみ対応しています")
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("ファイルサイズは10MB以下にしてください")
      return false
    }
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setError("")
      onFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && validateFile(file)) {
      setError("")
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-balance text-2xl font-bold text-slate-900 md:text-3xl">レシートをスキャン</h1>
          <p className="mt-2 text-sm text-slate-600">レシートを撮影またはアップロードしてください</p>
        </div>

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
            className="tap-target w-full gradient-primary hover:opacity-90"
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
            <Upload className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">ファイルをドラッグ&ドロップ</h3>
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
