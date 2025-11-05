"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { FormField } from "@/components/forms/form-field"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email) {
      setError("メールアドレスを入力してください")
      setIsLoading(false)
      return
    }

    // TODO: 実際のパスワードリセット処理
    setTimeout(() => {
      setSuccess(true)
      toast({
        title: "メール送信完了",
        description: "パスワードリセットのリンクを送信しました",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-primary px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft-lg md:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="gradient-primary flex h-16 w-16 items-center justify-center rounded-2xl shadow-soft">
              <Receipt className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-balance text-2xl font-bold text-foreground">パスワードをリセット</h1>
          <p className="mt-2 text-sm text-muted-foreground">登録したメールアドレスにリセットリンクを送信します</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <Alert className="border-success bg-success/10">
              <AlertDescription className="text-success-foreground">
                パスワードリセットのリンクを送信しました。メールをご確認ください。
              </AlertDescription>
            </Alert>
            <Link href="/login">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ログイン画面に戻る
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField label="メールアドレス" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormField>

            <Button type="submit" className="tap-target w-full gradient-primary hover:opacity-90" disabled={isLoading}>
              {isLoading ? "送信中..." : "リセットリンクを送信"}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ログイン画面に戻る
              </Button>
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
