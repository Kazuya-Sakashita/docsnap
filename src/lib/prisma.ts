// src/lib/prisma.ts
import { PrismaClient, type Prisma } from "@prisma/client"

/**
 * Next.js の開発モード（HMR）でも PrismaClient の多重生成を避けるためのシングルトン。
 * 本番ではグローバルに載せず毎回新規生成（Serverless 環境を考慮）。
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

/** 環境に応じたログ設定 */
const prismaLog: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"]

/** 追加のデバッグが必要なときは DEBUG_PRISMA=1 を付ける */
const log =
  process.env.DEBUG_PRISMA === "1"
    ? (["query", "info", "warn", "error"] as Prisma.LogLevel[])
    : prismaLog

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log,
  })

// 開発時のみグローバルに保持（HMRでの再インポート対策）
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/**
 * 注意:
 * - Edge Runtime（`runtime: "edge"`）では Prisma は非対応です。Route Handler/Server Action で
 *   使う場合は `export const runtime = "nodejs"` を明示してください。
 * - コールドスタート短縮が必要なら、明示的に `await prisma.$connect()` を呼ぶ箇所を検討してください。
 */
