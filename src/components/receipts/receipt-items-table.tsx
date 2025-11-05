"use client"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatAmount } from "@/lib/format"
import type { ReceiptItem } from "@/types/receipt"

interface ReceiptItemsTableProps {
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  onChange: (items: ReceiptItem[]) => void
}

export function ReceiptItemsTable({ items, subtotal, tax, total, onChange }: ReceiptItemsTableProps) {
  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      id: `item-${Date.now()}`,
      name: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    }
    onChange([...items, newItem])
  }

  const handleUpdateItem = (index: number, updates: Partial<ReceiptItem>) => {
    const newItems = [...items]
    const item = { ...newItems[index], ...updates }

    // 金額を自動計算
    if ("quantity" in updates || "unitPrice" in updates) {
      item.amount = item.quantity * item.unitPrice
    }

    newItems[index] = item
    onChange(newItems)
  }

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>明細</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          行を追加
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">品名</TableHead>
                <TableHead className="w-[15%] text-right">数量</TableHead>
                <TableHead className="w-[20%] text-right">単価</TableHead>
                <TableHead className="w-[20%] text-right">金額</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.name}
                      onChange={(e) => handleUpdateItem(index, { name: e.target.value })}
                      placeholder="品名"
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(index, {
                          quantity: Number(e.target.value),
                        })
                      }
                      className="h-9 text-right font-mono"
                      min="1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(index, {
                          unitPrice: Number(e.target.value),
                        })
                      }
                      className="h-9 text-right font-mono"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">{formatAmount(item.amount)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(index)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 合計 */}
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">小計</span>
            <span className="font-mono">{formatAmount(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">税</span>
            <span className="font-mono">{formatAmount(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
            <span>合計</span>
            <span className="font-mono">{formatAmount(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
