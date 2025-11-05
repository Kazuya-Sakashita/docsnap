"use client"

import { useState } from "react"
import { User, Key, ImageIcon, Clock, Download, Trash2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export function SettingsContent() {
  const [email, setEmail] = useState("user@example.com")
  const [timezone, setTimezone] = useState("Asia/Tokyo")
  const { toast } = useToast()

  const handleExportData = () => {
    toast({
      title: "データをエクスポートしました",
      description: "ダウンロードが開始されます",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "アカウントを削除しました",
      description: "ご利用ありがとうございました",
      variant: "destructive",
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">設定</h1>
        <p className="text-sm text-slate-600">アカウントとアプリの設定を管理</p>
      </div>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-slate-900">アカウント</CardTitle>
          </div>
          <CardDescription className="text-slate-600">メールアドレスとパスワードの管理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="border-blue-200"
            />
            <p className="text-sm text-slate-600">メールアドレスの変更はサポートにお問い合わせください</p>
          </div>

          <Separator className="bg-blue-200" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">パスワード</p>
              <p className="text-sm text-slate-600">最終更新: 2025年1月15日</p>
            </div>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              変更
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-slate-900">OCR設定</CardTitle>
          </div>
          <CardDescription className="text-slate-600">レシート解析の設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ocr-provider">OCRプロバイダ</Label>
            <Select defaultValue="default">
              <SelectTrigger id="ocr-provider" className="border-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">デフォルト（推奨）</SelectItem>
                <SelectItem value="advanced">高精度モード</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600">高精度モードは処理時間が長くなります</p>
          </div>

          <Separator className="bg-blue-200" />

          <div className="space-y-2">
            <Label htmlFor="image-storage">画像保存設定</Label>
            <Select defaultValue="private">
              <SelectTrigger id="image-storage" className="border-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">プライベート（署名URL）</SelectItem>
                <SelectItem value="public">パブリック（公開URL）</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600">プライベート設定では一時的なURLが生成されます</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-slate-900">タイムゾーン</CardTitle>
          </div>
          <CardDescription className="text-slate-600">日付と時刻の表示設定</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timezone">タイムゾーン</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="border-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Tokyo">日本標準時（JST）</SelectItem>
                <SelectItem value="America/New_York">東部標準時（EST）</SelectItem>
                <SelectItem value="Europe/London">グリニッジ標準時（GMT）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-slate-900">データ管理</CardTitle>
          </div>
          <CardDescription className="text-slate-600">データのエクスポートと削除</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">データのエクスポート</p>
              <p className="text-sm text-slate-600">すべてのデータをダウンロード</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              エクスポート
            </Button>
          </div>

          <Separator className="bg-blue-200" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">アカウントの削除</p>
              <p className="text-sm text-slate-600">すべてのデータが完全に削除されます</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。すべてのレシート、カテゴリ、設定が完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-slate-900">サポート</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-slate-600">バージョン: 1.0.0</p>
          <p className="text-sm text-slate-600">お問い合わせ: support@example.com</p>
        </CardContent>
      </Card>
    </div>
  )
}
