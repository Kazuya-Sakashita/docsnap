"use client"

import { useState } from "react"
import Link from "next/link"
import { Receipt, Building2, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import {
  signupPersonalSchema,
  signupBusinessSchema,
  type SignupPersonalFormData,
  type SignupBusinessFormData,
} from "@/lib/validations/auth"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [accountType, setAccountType] = useState<"personal" | "business">("personal")
  const { toast } = useToast()

  const personalForm = useForm<SignupPersonalFormData>({
    resolver: zodResolver(signupPersonalSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  })

  const businessForm = useForm<SignupBusinessFormData>({
    resolver: zodResolver(signupBusinessSchema),
    defaultValues: {
      companyName: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  })

  const handlePersonalSignup = async (data: SignupPersonalFormData) => {
    setError("")
    setIsLoading(true)

    // TODO: 実際の登録処理
    setTimeout(() => {
      toast({
        title: "アカウント作成成功",
        description: "ダッシュボードに移動します",
      })
      setIsLoading(false)
      // window.location.href = '/'
    }, 1000)
  }

  const handleBusinessSignup = async (data: SignupBusinessFormData) => {
    setError("")
    setIsLoading(true)

    // TODO: 実際の登録処理
    setTimeout(() => {
      toast({
        title: "アカウント作成成功",
        description: "ダッシュボードに移動します",
      })
      setIsLoading(false)
      // window.location.href = '/'
    }, 1000)
  }

  const currentForm = accountType === "personal" ? personalForm : businessForm
  const handleSubmit = accountType === "personal" ? handlePersonalSignup : handleBusinessSignup

  return (
    <div className="flex min-h-screen">
      {/* 左側: 新規登録フォーム */}
      <div className="flex w-full items-center justify-center bg-gradient-primary px-6 py-12 md:w-1/2">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-soft-lg md:p-10">
          {/* ロゴとヘッダー */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="gradient-primary flex h-16 w-16 items-center justify-center rounded-2xl shadow-soft">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">DocSnapをはじめる</h1>
            <p className="mt-2 text-sm text-muted-foreground">個人の家計管理から法人の経費精算まで</p>
          </div>

          {/* アカウントタイプ選択 */}
          <Tabs
            value={accountType}
            onValueChange={(value) => setAccountType(value as "personal" | "business")}
            className="mb-6 w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                個人
              </TabsTrigger>
              <TabsTrigger value="business" className="gap-2">
                <Building2 className="h-4 w-4" />
                法人
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={currentForm.handleSubmit(handleSubmit as any)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 個人用フォーム */}
            {accountType === "personal" && (
              <FormField label="お名前" htmlFor="name" error={personalForm.formState.errors.name}>
                <Input
                  id="name"
                  type="text"
                  placeholder="山田 太郎"
                  {...personalForm.register("name")}
                  autoComplete="name"
                />
              </FormField>
            )}

            {/* 法人用フォーム */}
            {accountType === "business" && (
              <>
                <FormField label="会社名" htmlFor="company-name" error={businessForm.formState.errors.companyName}>
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="株式会社サンプル"
                    {...businessForm.register("companyName")}
                    autoComplete="organization"
                  />
                </FormField>
                <FormField label="担当者名" htmlFor="name-business" error={businessForm.formState.errors.name}>
                  <Input
                    id="name-business"
                    type="text"
                    placeholder="山田 太郎"
                    {...businessForm.register("name")}
                    autoComplete="name"
                  />
                </FormField>
              </>
            )}

            <FormField label="メールアドレス" htmlFor="email" error={currentForm.formState.errors.email}>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...currentForm.register("email")}
                autoComplete="email"
              />
            </FormField>

            <FormField
              label="パスワード"
              htmlFor="password"
              error={currentForm.formState.errors.password}
              hint="英数字を含む8文字以上で設定してください"
            >
              <PasswordInput
                id="password"
                placeholder="8文字以上"
                {...currentForm.register("password")}
                autoComplete="new-password"
              />
            </FormField>

            <FormField
              label="パスワード（確認）"
              htmlFor="confirm-password"
              error={currentForm.formState.errors.confirmPassword}
            >
              <PasswordInput
                id="confirm-password"
                placeholder="もう一度入力"
                {...currentForm.register("confirmPassword")}
                autoComplete="new-password"
              />
            </FormField>

            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={currentForm.watch("agreedToTerms")}
                  onCheckedChange={(checked) => currentForm.setValue("agreedToTerms", checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
                  <Link href="/terms" className="text-primary hover:underline">
                    利用規約
                  </Link>
                  と
                  <Link href="/privacy" className="text-primary hover:underline">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>
              {currentForm.formState.errors.agreedToTerms && (
                <p className="text-sm text-destructive">{currentForm.formState.errors.agreedToTerms.message}</p>
              )}
            </div>

            <Button type="submit" className="tap-target w-full gradient-primary hover:opacity-90" disabled={isLoading}>
              {isLoading ? "アカウント作成中..." : "アカウントを作成"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              すでにアカウントをお持ちですか？
              <Link href="/login" className="ml-1 text-primary hover:underline">
                ログイン
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* 右側: サマリーイメージ */}
      <div className="hidden w-1/2 items-center justify-center bg-white/5 backdrop-blur-sm md:flex">
        <div className="max-w-md space-y-6 p-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
            <Receipt className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-balance text-2xl font-bold text-slate-700">
            レシート・領収書管理を
            <br />
            もっとシンプルに
          </h2>
          <ul className="space-y-4 text-left text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                ✓
              </div>
              <span>スマホで撮影するだけで自動でデータ化</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                ✓
              </div>
              <span>家計管理や経費精算に必要な情報を自動集計</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                ✓
              </div>
              <span>CSVエクスポートで会計ソフトとも連携可能</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                ✓
              </div>
              <span>個人利用も法人利用も同じプラットフォームで</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
