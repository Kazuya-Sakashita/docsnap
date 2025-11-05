"use client"

import { useState } from "react"
import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function ExportContent() {
  const [encoding, setEncoding] = useState("UTF-8")
  const [selectedColumns, setSelectedColumns] = useState({
    id: true,
    type: true,
    storeName: true,
    purchaseDate: true,
    total: true,
    currency: true,
    category: true,
    memo: true,
    items: false,
    invoiceNumber: false,
    recipientName: false,
    purpose: false,
    registrationNumber: false,
    paymentMethod: false,
  })
  const { toast } = useToast()

  const handleExport = () => {
    // TODO: 実際のエクスポート処理
    toast({
      title: "CSVをダウンロードしました",
      description: "ファイルを確認してください",
    })
  }

  const toggleColumn = (column: keyof typeof selectedColumns) => {
    setSelectedColumns({ ...selectedColumns, [column]: !selectedColumns[column] })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">CSVエクスポート</h1>
        <p className="text-sm text-slate-600">レシートデータをCSV形式でダウンロードできます</p>
      </div>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-slate-900">エクスポート設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 文字コード */}
          <div className="space-y-2">
            <Label htmlFor="encoding">文字コード</Label>
            <Select value={encoding} onValueChange={setEncoding}>
              <SelectTrigger id="encoding" className="border-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTF-8">UTF-8（推奨）</SelectItem>
                <SelectItem value="Shift_JIS">Shift_JIS（Excel互換）</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600">Excelで開く場合はShift_JISを選択してください</p>
          </div>

          {/* 列選択 */}
          <div className="space-y-3">
            <Label>出力する列</Label>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">基本項目</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="col-id" checked={selectedColumns.id} onCheckedChange={() => toggleColumn("id")} />
                  <label htmlFor="col-id" className="text-sm text-slate-900">
                    ID
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="col-type" checked={selectedColumns.type} onCheckedChange={() => toggleColumn("type")} />
                  <label htmlFor="col-type" className="text-sm text-slate-900">
                    種別
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-storeName"
                    checked={selectedColumns.storeName}
                    onCheckedChange={() => toggleColumn("storeName")}
                  />
                  <label htmlFor="col-storeName" className="text-sm text-slate-900">
                    店舗名/発行者名
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-purchaseDate"
                    checked={selectedColumns.purchaseDate}
                    onCheckedChange={() => toggleColumn("purchaseDate")}
                  />
                  <label htmlFor="col-purchaseDate" className="text-sm text-slate-900">
                    購入日/発行日
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-total"
                    checked={selectedColumns.total}
                    onCheckedChange={() => toggleColumn("total")}
                  />
                  <label htmlFor="col-total" className="text-sm text-slate-900">
                    合計金額
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-currency"
                    checked={selectedColumns.currency}
                    onCheckedChange={() => toggleColumn("currency")}
                  />
                  <label htmlFor="col-currency" className="text-sm text-slate-900">
                    通貨
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-category"
                    checked={selectedColumns.category}
                    onCheckedChange={() => toggleColumn("category")}
                  />
                  <label htmlFor="col-category" className="text-sm text-slate-900">
                    カテゴリ
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="col-memo" checked={selectedColumns.memo} onCheckedChange={() => toggleColumn("memo")} />
                  <label htmlFor="col-memo" className="text-sm text-slate-900">
                    メモ
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-items"
                    checked={selectedColumns.items}
                    onCheckedChange={() => toggleColumn("items")}
                  />
                  <label htmlFor="col-items" className="text-sm text-slate-900">
                    明細を含む
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <p className="mb-2 text-sm font-medium text-primary">領収書固有項目</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-invoiceNumber"
                    checked={selectedColumns.invoiceNumber}
                    onCheckedChange={() => toggleColumn("invoiceNumber")}
                  />
                  <label htmlFor="col-invoiceNumber" className="text-sm text-slate-900">
                    領収書番号
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-recipientName"
                    checked={selectedColumns.recipientName}
                    onCheckedChange={() => toggleColumn("recipientName")}
                  />
                  <label htmlFor="col-recipientName" className="text-sm text-slate-900">
                    宛名
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-purpose"
                    checked={selectedColumns.purpose}
                    onCheckedChange={() => toggleColumn("purpose")}
                  />
                  <label htmlFor="col-purpose" className="text-sm text-slate-900">
                    但書
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-registrationNumber"
                    checked={selectedColumns.registrationNumber}
                    onCheckedChange={() => toggleColumn("registrationNumber")}
                  />
                  <label htmlFor="col-registrationNumber" className="text-sm text-slate-900">
                    登録番号
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-paymentMethod"
                    checked={selectedColumns.paymentMethod}
                    onCheckedChange={() => toggleColumn("paymentMethod")}
                  />
                  <label htmlFor="col-paymentMethod" className="text-sm text-slate-900">
                    支払方法
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プレビュー */}
      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-slate-900">プレビュー（最大10行）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200">
                  {selectedColumns.id && <th className="p-2 text-left text-slate-900">ID</th>}
                  {selectedColumns.type && <th className="p-2 text-left text-slate-900">種別</th>}
                  {selectedColumns.storeName && <th className="p-2 text-left text-slate-900">店舗名</th>}
                  {selectedColumns.purchaseDate && <th className="p-2 text-left text-slate-900">購入日</th>}
                  {selectedColumns.total && <th className="p-2 text-right text-slate-900">合計金額</th>}
                  {selectedColumns.currency && <th className="p-2 text-left text-slate-900">通貨</th>}
                  {selectedColumns.category && <th className="p-2 text-left text-slate-900">カテゴリ</th>}
                  {selectedColumns.memo && <th className="p-2 text-left text-slate-900">メモ</th>}
                  {selectedColumns.invoiceNumber && <th className="p-2 text-left text-slate-900">領収書番号</th>}
                  {selectedColumns.recipientName && <th className="p-2 text-left text-slate-900">宛名</th>}
                  {selectedColumns.purpose && <th className="p-2 text-left text-slate-900">但書</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-blue-100">
                  {selectedColumns.id && <td className="p-2 text-slate-900">1</td>}
                  {selectedColumns.type && <td className="p-2 text-slate-900">レシート</td>}
                  {selectedColumns.storeName && <td className="p-2 text-slate-900">イオン</td>}
                  {selectedColumns.purchaseDate && <td className="p-2 text-slate-900">2025/02/01</td>}
                  {selectedColumns.total && <td className="p-2 text-right text-slate-900">4,950</td>}
                  {selectedColumns.currency && <td className="p-2 text-slate-900">JPY</td>}
                  {selectedColumns.category && <td className="p-2 text-slate-900">食費</td>}
                  {selectedColumns.memo && <td className="p-2 text-slate-600">-</td>}
                  {selectedColumns.invoiceNumber && <td className="p-2 text-slate-600">-</td>}
                  {selectedColumns.recipientName && <td className="p-2 text-slate-600">-</td>}
                  {selectedColumns.purpose && <td className="p-2 text-slate-600">-</td>}
                </tr>
                <tr className="border-b border-blue-100">
                  {selectedColumns.id && <td className="p-2 text-slate-900">2</td>}
                  {selectedColumns.type && <td className="p-2 text-slate-900">領収書</td>}
                  {selectedColumns.storeName && <td className="p-2 text-slate-900">株式会社ABC</td>}
                  {selectedColumns.purchaseDate && <td className="p-2 text-slate-900">2025/01/30</td>}
                  {selectedColumns.total && <td className="p-2 text-right text-slate-900">55,000</td>}
                  {selectedColumns.currency && <td className="p-2 text-slate-900">JPY</td>}
                  {selectedColumns.category && <td className="p-2 text-slate-600">-</td>}
                  {selectedColumns.memo && <td className="p-2 text-slate-600">-</td>}
                  {selectedColumns.invoiceNumber && <td className="p-2 text-slate-900">INV-2025-001</td>}
                  {selectedColumns.recipientName && <td className="p-2 text-slate-900">株式会社XYZ 御中</td>}
                  {selectedColumns.purpose && <td className="p-2 text-slate-900">業務委託費として</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Alert className="border-blue-200 bg-blue-50/50">
        <FileText className="h-4 w-4 text-primary" />
        <AlertDescription>
          <p className="mb-2 font-medium text-slate-900">注意事項</p>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>• エクスポートされたファイルには個人情報が含まれます</li>
            <li>• ファイルの取り扱いには十分注意してください</li>
            <li>• 定期的にバックアップを取ることをお勧めします</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* ダウンロードボタン */}
      <Button size="lg" className="tap-target w-full gradient-primary hover:opacity-90" onClick={handleExport}>
        <Download className="mr-2 h-5 w-5" />
        CSVをダウンロード
      </Button>
    </div>
  )
}
