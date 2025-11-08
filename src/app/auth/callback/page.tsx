// src/app/auth/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"
import Link from "next/link"

type VerificationState = "verifying" | "success" | "error" | "expired"

/** #foo=bar&baz=qux → { foo:"bar", baz:"qux" } */
function parseHash(hash: string): Record<string, string> {
  const h = hash.startsWith("#") ? hash.slice(1) : hash
  if (!h) return {}
  return h.split("&").reduce<Record<string, string>>((acc, kv) => {
    const [k, v = ""] = kv.split("=")
    if (!k) return acc
    acc[decodeURIComponent(k)] = decodeURIComponent(v)
    return acc
  }, {})
}

/** クエリとハッシュを統合して取得（重複はクエリを優先） */
function getCallbackParams(sp: ReturnType<typeof useSearchParams>): Record<string, string> {
  const queryObj = Object.fromEntries(sp.entries())
  const hashObj = typeof window !== "undefined" ? parseHash(window.location.hash) : {}
  // 例：{ token, code, access_token, error, error_description, ... }
  return { ...hashObj, ...queryObj }
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerificationState>("verifying")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const all = getCallbackParams(searchParams)
        // ❌ 未使用の `type`, `refresh_token` を除去
        const { token, code, access_token, error, error_description } = all

        console.log("[callback] all params:", all)

        // エラーパラメータ
        if (error) {
          setState("error")
          setErrorMessage(error_description || "メール認証に失敗しました")
          return
        }

        if (!token && !code && !access_token) {
          setState("error")
          setErrorMessage("認証情報が見つかりません（リンクの形式が不正か、期限切れの可能性）")
          return
        }

        // TODO: Supabase 連携（例）
        // if (code) await supabase.auth.exchangeCodeForSession(code)
        // else if (access_token && refresh_token) await supabase.auth.setSession({ access_token, refresh_token })
        // else if (token && type) await supabase.auth.verifyOtp({ token_hash: token, type })

        // 仮の処理（2秒待機して成功表示）
        await new Promise((r) => setTimeout(r, 2000))
        setState("success")
        setTimeout(() => router.push("/"), 3000)
      } catch (err) {
        console.error("[callback] verification error:", err)
        setState("error")
        setErrorMessage(err instanceof Error ? err.message : "予期しないエラーが発生しました")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-slate-50 p-4">
      <Card className="w-full max-w-md border-blue-100 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardContent className="px-8 pt-12 pb-10">
          {state === "verifying" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="shadow-soft-lg flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700">
                    <Mail className="h-10 w-10 text-white" />
                  </div>
                  <Loader2 className="absolute -top-2 -right-2 h-8 w-8 animate-spin text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">メールアドレスを確認中...</h1>
                <p className="text-gray-600">少々お待ちください</p>
              </div>
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
                </div>
              </div>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="shadow-soft-lg animate-in zoom-in-50 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-green-700 duration-300">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">認証が完了しました</h1>
                <p className="text-gray-600">
                  メールアドレスの確認が完了しました。
                  <br />
                  まもなくダッシュボードに移動します...
                </p>
              </div>
              <Alert className="border-green-200 bg-green-50 text-left">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-800">
                  アカウントが有効化されました。DocSnapのすべての機能をご利用いただけます。
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push("/")}
                className="shadow-soft w-full bg-linear-to-r from-blue-500 to-blue-700 font-medium text-white hover:from-blue-600 hover:to-blue-800"
              >
                ダッシュボードへ移動
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="shadow-soft-lg animate-in zoom-in-50 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-700 duration-300">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">認証に失敗しました</h1>
                <p className="text-gray-600">メールアドレスの確認中にエラーが発生しました</p>
              </div>
              <Alert className="border-red-200 bg-red-50 text-left">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  {errorMessage || "認証リンクが無効または期限切れの可能性があります"}
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">以下の対処方法をお試しください：</p>
                <ul className="space-y-2 rounded-lg bg-slate-50 p-4 text-left text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>メールの認証リンクを再度クリックしてください</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>リンクの有効期限が切れている場合は、再度サインアップしてください</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>問題が解決しない場合は、サポートにお問い合わせください</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="shadow-soft w-full bg-linear-to-r from-blue-500 to-blue-700 font-medium text-white hover:from-blue-600 hover:to-blue-800"
                >
                  <Link href="/signup">新規登録ページへ</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-blue-200 bg-transparent hover:bg-blue-50"
                >
                  <Link href="/login">ログインページへ</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
