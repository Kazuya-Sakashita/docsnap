"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ReceiptIcon, FileText } from "lucide-react"
import type { Receipt, ReceiptType } from "@/types/receipt"

interface ReceiptEditFormProps {
  receipt: Receipt
  onChange: (updates: Partial<Receipt>) => void
}

const statusConfig = {
  READY: { label: "完了", variant: "default" as const },
  PROCESSING: { label: "解析中", variant: "secondary" as const },
  ERROR: { label: "エラー", variant: "destructive" as const },
  DUPLICATE: { label: "重複", variant: "warning" as const },
}

export function ReceiptEditForm({ receipt, onChange }: ReceiptEditFormProps) {
  const statusInfo = statusConfig[receipt.status]
  const needsReview = receipt.confidenceScore && receipt.confidenceScore < 0.8
  const isInvoice = receipt.type === "INVOICE"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>基本情報</CardTitle>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsReview && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              信頼スコアが低いため、内容を確認してください（スコア: {(receipt.confidenceScore! * 100).toFixed(0)}%）
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>種別</Label>
          <Tabs
            value={receipt.type}
            onValueChange={(value) => onChange({ type: value as ReceiptType })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="RECEIPT" className="gap-2">
                <ReceiptIcon className="h-4 w-4" />
                レシート
              </TabsTrigger>
              <TabsTrigger value="INVOICE" className="gap-2">
                <FileText className="h-4 w-4" />
                領収書
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isInvoice && (
          <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">領収書固有項目</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">
                  領収書番号 <span className="text-xs text-muted-foreground">(任意)</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  value={receipt.invoiceNumber || ""}
                  onChange={(e) => onChange({ invoiceNumber: e.target.value })}
                  placeholder="No.12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">
                  宛名 <span className="text-xs text-muted-foreground">(任意)</span>
                </Label>
                <Input
                  id="recipientName"
                  value={receipt.recipientName || ""}
                  onChange={(e) => onChange({ recipientName: e.target.value })}
                  placeholder="株式会社〇〇 御中"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">
                但書 <span className="text-xs text-muted-foreground">(任意)</span>
              </Label>
              <Input
                id="purpose"
                value={receipt.purpose || ""}
                onChange={(e) => onChange({ purpose: e.target.value })}
                placeholder="お品代として"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                登録番号（インボイス） <span className="text-xs text-muted-foreground">(任意)</span>
              </Label>
              <Input
                id="registrationNumber"
                value={receipt.registrationNumber || ""}
                onChange={(e) => onChange({ registrationNumber: e.target.value })}
                placeholder="T1234567890123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuerAddress">
                発行者住所 <span className="text-xs text-muted-foreground">(任意)</span>
              </Label>
              <Input
                id="issuerAddress"
                value={receipt.issuerAddress || ""}
                onChange={(e) => onChange({ issuerAddress: e.target.value })}
                placeholder="東京都〇〇区..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentDueDate">
                  支払期日 <span className="text-xs text-muted-foreground">(任意)</span>
                </Label>
                <Input
                  id="paymentDueDate"
                  type="date"
                  value={receipt.paymentDueDate || ""}
                  onChange={(e) => onChange({ paymentDueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">
                  支払方法 <span className="text-xs text-muted-foreground">(任意)</span>
                </Label>
                <Select
                  value={receipt.paymentMethod || ""}
                  onValueChange={(value) => onChange({ paymentMethod: value })}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="現金">現金</SelectItem>
                    <SelectItem value="クレジットカード">クレジットカード</SelectItem>
                    <SelectItem value="銀行振込">銀行振込</SelectItem>
                    <SelectItem value="電子マネー">電子マネー</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={receipt.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="レシートのタイトル"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeName">{isInvoice ? "発行者名" : "店舗名"}</Label>
          <Input
            id="storeName"
            value={receipt.storeName}
            onChange={(e) => onChange({ storeName: e.target.value })}
            placeholder={isInvoice ? "発行者名を入力" : "店舗名を入力"}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">{isInvoice ? "発行日" : "購入日"}</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={receipt.purchaseDate}
              onChange={(e) => onChange({ purchaseDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">通貨</Label>
            <Select value={receipt.currency} onValueChange={(value) => onChange({ currency: value })}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JPY">JPY（日本円）</SelectItem>
                <SelectItem value="USD">USD（米ドル）</SelectItem>
                <SelectItem value="EUR">EUR（ユーロ）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="subtotal">小計</Label>
            <Input
              id="subtotal"
              type="number"
              value={receipt.subtotal}
              onChange={(e) => onChange({ subtotal: Number(e.target.value) })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax">税</Label>
            <Input
              id="tax"
              type="number"
              value={receipt.tax}
              onChange={(e) => onChange({ tax: Number(e.target.value) })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">合計</Label>
            <Input
              id="total"
              type="number"
              value={receipt.total}
              onChange={(e) => onChange({ total: Number(e.target.value) })}
              className="font-mono font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="memo">メモ</Label>
          <Textarea
            id="memo"
            value={receipt.memo || ""}
            onChange={(e) => onChange({ memo: e.target.value })}
            placeholder="メモを入力（任意）"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}
