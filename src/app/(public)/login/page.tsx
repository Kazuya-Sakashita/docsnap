// src/app/(public)/login/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Receipt } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { useUser } from "@/hooks/useUser"

type LoginApiOk = { ok: true; user?: { id: string; email: string | null } }
type LoginApiErr = { ok: false; error: string }
type LoginApiResponse = LoginApiOk | LoginApiErr

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const { mutate } = useUser()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLogin = async (data: LoginFormData) => {
    setError("")
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // same-origin なのでクッキー受け取りはデフォルトでOK
        body: JSON.stringify(data),
      })

      let json: LoginApiResponse | null = null
      try {
        json = (await res.json()) as LoginApiResponse
      } catch {
        // JSONでない応答の可能性もあるため握りつぶす
      }

      const isOk = res.ok && json !== null && json.ok === true

      if (!isOk) {
        const msg =
          (json && json.ok === false && json.error) ||
          (res.status === 401
            ? "メールアドレスまたはパスワードが正しくありません"
            : "ログインに失敗しました")
        setError(msg)
        return
      }

      // SWRのユーザー情報を即時更新（/api/session を再フェッチ）
      await mutate()

      toast({
        title: "ログインしました",
        description: "ダッシュボードへ移動します",
      })

      // 遷移先は必要に応じて変更（例: "/dashboard"）
      router.replace("/")
    } catch (_e) {
      setError("ネットワークエラーが発生しました。時間をおいて再度お試しください")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 左側: ログインフォーム */}
      <div className="bg-gradient-primary flex w-full items-center justify-center px-6 py-12 md:w-1/2">
        <div className="shadow-soft-lg w-full max-w-md rounded-2xl bg-white p-8 md:p-10">
          {/* ロゴとヘッダー */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="gradient-primary shadow-soft flex h-16 w-16 items-center justify-center rounded-2xl">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance">
              DocSnap
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Smart. Secure. Organized.</p>
          </div>

          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField label="メールアドレス" htmlFor="email" error={form.formState.errors.email}>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...form.register("email")}
                autoComplete="email"
                disabled={isLoading}
              />
            </FormField>

            <FormField label="パスワード" htmlFor="password" error={form.formState.errors.password}>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...form.register("password")}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </FormField>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-primary text-sm hover:underline">
                パスワードをお忘れですか？
              </Link>
            </div>

            <Button
              type="submit"
              className="tap-target gradient-primary w-full hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>

            <div className="text-muted-foreground text-center text-sm">
              アカウントをお持ちでない方は
              <Link href="/signup" className="text-primary ml-1 hover:underline">
                新規登録
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* 右側: サマリーイメージ */}
      <div className="hidden w-1/2 items-center justify-center bg-white/5 backdrop-blur-sm md:flex">
        <div className="max-w-md space-y-6 p-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
            <Receipt className="text-primary h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-balance text-slate-700">
            レシート・領収書管理を
            <br />
            もっとシンプルに
          </h2>
          <ul className="space-y-4 text-left text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                ✓
              </div>
              <span>スマホで撮影するだけで自動でデータ化</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                ✓
              </div>
              <span>家計管理や経費精算に必要な情報を自動集計</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                ✓
              </div>
              <span>CSVエクスポートで会計ソフトとも連携可能</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
