// src/app/(auth)/signup/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Receipt, Building2, User } from "lucide-react"
import { useForm, type UseFormReturn, type FieldErrors, type FieldError } from "react-hook-form"
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
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// 個人/法人の共通フィールド（companyName は法人のみ）
type CommonSignupForm = {
  email: string
  name: string
  password: string
  confirmPassword: string
  agreedToTerms: boolean
  companyName?: string
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [accountType, setAccountType] = useState<"personal" | "business">("personal")
  const { toast } = useToast()
  const router = useRouter()

  const personalForm = useForm<SignupPersonalFormData>({
    resolver: zodResolver(signupPersonalSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
    mode: "onChange",
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
    mode: "onChange",
  })

  // ユニオンを共通フォーム型に統一（register/watch/setValue の型エラー回避）
  const currentForm = (accountType === "personal"
    ? personalForm
    : businessForm) as unknown as UseFormReturn<CommonSignupForm>

  // Checkbox の表示値（CheckedState → boolean に正規化）
  const agreed = !!currentForm.watch("agreedToTerms")

  // Supabase へサインアップ（確認メール送信）
  const submit = async (values: CommonSignupForm) => {
    setError("")
    setIsLoading(true)

    console.groupCollapsed("[signup] supabase.auth.signUp")
    console.table({
      name: values.name,
      email: values.email,
      password: "********",
      accountType,
      companyName: accountType === "business" ? (values.companyName ?? "") : "(n/a)",
    })
    console.groupEnd()

    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL ?? "")

      // data は未使用なので受け取らない
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          // 認証後に戻すURL（Dashboard > Auth > URL Configuration の Redirect URLs に登録必須）
          emailRedirectTo: `${origin}/auth/callback`,
          // メタデータに補足情報を入れておく（任意）
          data: {
            name: values.name,
            accountType,
            companyName: accountType === "business" ? (values.companyName ?? "") : undefined,
          },
        },
      })

      if (error) throw error

      // 成功トースト（メール確認が必要）
      toast({
        title: "確認メールを送信しました",
        description: "メール内のリンクから認証を完了してください。",
      })

      // 案内ページへ遷移（メールアドレスをクエリに載せると再送で便利）
      router.replace(
        `/verify-email?email=${encodeURIComponent(values.email)}&next=${encodeURIComponent("/dashboard")}`,
      )

      // 必要ならフォームをリセット
      currentForm.reset()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "サインアップに失敗しました"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // 共通の SubmitHandler（any を使わずに分岐）
  const handleSubmit = async (values: CommonSignupForm) => {
    if (accountType === "personal") {
      const payload: SignupPersonalFormData = {
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        agreedToTerms: values.agreedToTerms,
      }
      await submit(payload)
    } else {
      const payload: SignupBusinessFormData = {
        companyName: values.companyName ?? "",
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        agreedToTerms: values.agreedToTerms,
      }
      await submit(payload)
    }
  }

  // ボタン活性条件：送信中でない && 規約同意 && バリデーションOK
  const canSubmit = !isLoading && agreed && currentForm.formState.isValid

  // 型付けされた errors を一元参照
  const errors = currentForm.formState.errors as FieldErrors<CommonSignupForm>

  return (
    <div className="flex min-h-screen">
      {/* 左側: 新規登録フォーム */}
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
              DocSnapをはじめる
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              個人の家計管理から法人の経費精算まで
            </p>
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

          <form
            onSubmit={(e) => {
              console.log("[signup] <form> onSubmit fired")
              return currentForm.handleSubmit(handleSubmit)(e)
            }}
            className="space-y-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 個人用フィールド */}
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

            {/* 法人用フィールド */}
            {accountType === "business" && (
              <>
                <FormField
                  label="会社名"
                  htmlFor="company-name"
                  error={businessForm.formState.errors.companyName}
                >
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="株式会社サンプル"
                    {...businessForm.register("companyName")}
                    autoComplete="organization"
                  />
                </FormField>
                <FormField
                  label="担当者名"
                  htmlFor="name-business"
                  error={businessForm.formState.errors.name}
                >
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

            {/* 共通フィールド（currentForm で統一） */}
            <FormField
              label="メールアドレス"
              htmlFor="email"
              error={errors.email as FieldError | undefined}
            >
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
              error={errors.password as FieldError | undefined}
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
              error={errors.confirmPassword as FieldError | undefined}
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
                  checked={agreed}
                  onCheckedChange={(v) =>
                    currentForm.setValue("agreedToTerms", v === true, { shouldValidate: true })
                  }
                />
                <label htmlFor="terms" className="text-muted-foreground text-sm leading-relaxed">
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
              {(() => {
                const agreedErr = errors.agreedToTerms as FieldError | undefined
                return agreedErr ? (
                  <p className="text-destructive text-sm">{agreedErr.message}</p>
                ) : null
              })()}
            </div>

            <Button
              type="submit"
              onClick={() => console.log("[signup] <Button> clicked")}
              className="tap-target gradient-primary w-full hover:opacity-90"
              disabled={!canSubmit}
            >
              {isLoading ? "アカウント作成中..." : "アカウントを作成"}
            </Button>

            <div className="text-muted-foreground text-center text-sm">
              すでにアカウントをお持ちですか？
              <Link href="/login" className="text-primary ml-1 hover:underline">
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
            <li className="flex items-start gap-3">
              <div className="bg-primary/20 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
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
