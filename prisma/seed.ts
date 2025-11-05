import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 データベースのシード開始...")

  // デモユーザーを作成
  const user = await prisma.user.upsert({
    where: { email: "demo@docsnap.com" },
    update: {},
    create: {
      email: "demo@docsnap.com",
      password: "hashed_password_here", // 実際にはbcryptでハッシュ化する
      name: "デモユーザー",
      accountType: "PERSONAL",
    },
  })

  console.log("✅ ユーザー作成完了:", user.email)

  // デフォルトカテゴリを作成
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: "食費" } },
      update: {},
      create: {
        userId: user.id,
        name: "食費",
        color: "#ef4444",
        usageCount: 0,
      },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: "交通費" } },
      update: {},
      create: {
        userId: user.id,
        name: "交通費",
        color: "#3b82f6",
        usageCount: 0,
      },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: "日用品" } },
      update: {},
      create: {
        userId: user.id,
        name: "日用品",
        color: "#8b5cf6",
        usageCount: 0,
      },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: "娯楽" } },
      update: {},
      create: {
        userId: user.id,
        name: "娯楽",
        color: "#ec4899",
        usageCount: 0,
      },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: "その他" } },
      update: {},
      create: {
        userId: user.id,
        name: "その他",
        color: "#64748b",
        usageCount: 0,
      },
    }),
  ])

  console.log("✅ カテゴリ作成完了:", categories.length, "件")

  // サンプルレシートを作成
  const receipt = await prisma.receipt.create({
    data: {
      userId: user.id,
      type: "RECEIPT",
      title: "イオン",
      storeName: "イオン",
      purchaseDate: new Date("2025-02-01"),
      currency: "JPY",
      subtotal: 4500,
      tax: 450,
      total: 4950,
      status: "READY",
      categoryId: categories[0].id,
      confidenceScore: 0.95,
      items: {
        create: [
          {
            name: "牛乳",
            quantity: 2,
            unitPrice: 200,
            amount: 400,
          },
          {
            name: "パン",
            quantity: 1,
            unitPrice: 150,
            amount: 150,
          },
        ],
      },
    },
  })

  console.log("✅ サンプルレシート作成完了:", receipt.id)

  console.log("🎉 シード完了!")
}

main()
  .catch((e) => {
    console.error("❌ シードエラー:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
