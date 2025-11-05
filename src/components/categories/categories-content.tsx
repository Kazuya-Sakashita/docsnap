"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

interface Category {
  id: string
  name: string
  color: string
  count: number
}

export function CategoriesContent() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "食費", color: "#ef4444", count: 45 },
    { id: "2", name: "交通費", color: "#3b82f6", count: 18 },
    { id: "3", name: "日用品", color: "#8b5cf6", count: 22 },
    { id: "4", name: "娯楽", color: "#ec4899", count: 15 },
    { id: "5", name: "その他", color: "#6b7280", count: 8 },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6")

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "エラー",
        description: "カテゴリ名を入力してください",
        variant: "destructive",
      })
      return
    }

    if (editingCategory) {
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name: newCategoryName, color: newCategoryColor } : cat,
        ),
      )
      toast({
        title: "カテゴリを更新しました",
      })
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName,
        color: newCategoryColor,
        count: 0,
      }
      setCategories([...categories, newCategory])
      toast({
        title: "カテゴリを追加しました",
      })
    }

    setIsDialogOpen(false)
    setEditingCategory(null)
    setNewCategoryName("")
    setNewCategoryColor("#3b82f6")
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    toast({
      title: "カテゴリを削除しました",
    })
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategoryColor(category.color)
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingCategory(null)
    setNewCategoryName("")
    setNewCategoryColor("#3b82f6")
    setIsDialogOpen(true)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">カテゴリ管理</h1>
          <p className="text-sm text-slate-600">レシートのカテゴリを管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "カテゴリを編集" : "カテゴリを追加"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">カテゴリ名</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="例: 食費"
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-color">カラー</Label>
                <div className="flex gap-2">
                  <Input
                    id="category-color"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="h-10 w-20"
                  />
                  <Input
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="border-blue-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSaveCategory} className="gradient-primary hover:opacity-90">
                保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-200 shadow-soft">
        <CardHeader>
          <CardTitle className="text-slate-900">カテゴリ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-4 transition-all hover:border-primary hover:shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{category.name}</p>
                    <p className="text-sm text-slate-600">{category.count}件のレシート</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>カテゴリを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          このカテゴリに紐づくレシートは「未分類」になります。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
