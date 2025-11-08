import Link from "next/link"
import { Receipt, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen">
      {/* 左側: メール送信完了メッセージ */}
      <div className="flex w-full items-center justify-center bg-linear-to-br from-blue-500 to-blue-700 px-6 py-12 md:w-1/2">
        <div className="shadow-soft-lg w-full max-w-md rounded-2xl bg-white p-8 md:p-10">
          {/* ロゴとヘッダー */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="gradient-primary shadow-soft relative flex h-16 w-16 items-center justify-center rounded-2xl">
                <Mail className="h-8 w-8 text-white" />
                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-sm">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance">
              認証メールを送信しました
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              ご登録いただいたメールアドレスに確認メールをお送りしました
            </p>
          </div>

          {/* メール確認の手順 */}
          <div className="space-y-6">
            <div className="rounded-xl bg-linear-to-b from-blue-50/80 to-slate-50/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-700">次のステップ</h2>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="bg-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                    1
                  </span>
                  <span>受信トレイを確認してください</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                    2
                  </span>
                  <span>「DocSnapへようこそ」という件名のメールを開いてください</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                    3
                  </span>
                  <span>メール内の認証リンクをクリックしてアカウントを有効化してください</span>
                </li>
              </ol>
            </div>

            {/* メールが届かない場合 */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">メールが届かない場合</h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>迷惑メールフォルダをご確認ください</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>メールアドレスに誤りがないかご確認ください</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>数分経っても届かない場合は、再度お試しください</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                asChild
                className="tap-target w-full bg-linear-to-r from-blue-500 to-blue-700 text-white hover:opacity-90"
              >
                <Link href="/login">ログインページへ戻る</Link>
              </Button>

              <Button asChild variant="outline" className="tap-target w-full bg-transparent">
                <Link href="/signup">新規登録をやり直す</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 右側: サマリーイメージ */}
      <div className="hidden w-1/2 items-center justify-center bg-linear-to-br from-slate-50 to-blue-50 md:flex">
        <div className="max-w-md space-y-6 p-8 text-center">
          <div className="shadow-soft-lg mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white">
            <Receipt className="text-primary h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-balance text-slate-700">
            アカウント認証後は
            <br />
            すぐに使い始められます
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
