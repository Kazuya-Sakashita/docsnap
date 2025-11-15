// src/lib/receipt/parser.ts
import type { NormalizedReceipt } from "@/components/receipt/types"

export type ParseContext = {
  text: string // OCR全文（正規化後）
  lines: string[] // 行ごと
}

export type ParseResult = {
  receipt: NormalizedReceipt | null
  confidence: number
  warnings?: string[]
  parser: string
}

export interface ReceiptParser {
  detect(ctx: ParseContext): number // 0..1: 適合度
  parse(ctx: ParseContext): ParseResult // 実際のパース
}

export class ParserRegistry {
  constructor(private parsers: ReceiptParser[]) {}
  run(ctx: ParseContext): ParseResult {
    const ranked = this.parsers
      .map((p) => ({ p, score: p.detect(ctx) }))
      .sort((a, b) => b.score - a.score)

    for (const { p } of ranked) {
      const out = p.parse(ctx)
      if (out.receipt) return out
    }
    return { receipt: null, confidence: 0, parser: "none", warnings: ["no parser matched"] }
  }
}
