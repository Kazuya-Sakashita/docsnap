"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"

const COLORS = ["#3B82F6", "#1E40AF", "#64748B", "#60A5FA", "#94A3B8"]

export function CategoryChart() {
  // TODO: 実際のデータを取得
  const categoryData = [
    { name: "食費", value: 45000, fill: COLORS[0] },
    { name: "交通費", value: 18000, fill: COLORS[1] },
    { name: "日用品", value: 22500, fill: COLORS[2] },
    { name: "娯楽", value: 25000, fill: COLORS[3] },
    { name: "その他", value: 15000, fill: COLORS[4] },
  ]

  return (
    <Card className="border-blue-200 shadow-soft">
      <CardHeader>
        <CardTitle className="text-slate-900">カテゴリ別支出</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
              isAnimationActive={false}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} fillOpacity={1} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
