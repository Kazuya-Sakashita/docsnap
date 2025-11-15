// src/lib/receipt/parsers/seven.ts
import { norm } from "../normalize"
import type { ReceiptParser, ParseContext, ParseResult } from "../parser"
import { GenericParser } from "./generic"

const HINTS = [/セブン.?イレブン/i, /SEVEN.?ELEVEN/i, /\b7i?\b/]

export class SevenElevenParser implements ReceiptParser {
  detect({ text }: ParseContext): number {
    const t = norm.z2h(text)
    return HINTS.some((rx) => rx.test(t)) ? 0.95 : 0.1
  }

  parse(ctx: ParseContext): ParseResult {
    // まず generic で叩いてベースを作る → 足りない/誤りを補正
    const base = new GenericParser().parse(ctx)
    const r = base.receipt
    if (!r) return base

    // セブン特有の軽減税率や袋3円の10%などの補正例
    for (const it of r.items) {
      if (it.name.includes("袋") || it.name.includes("レジ袋")) {
        it.taxRate = 10
      } else if (it.taxRate == null) {
        it.taxRate = 8 // 食品優先
      }
    }

    // ✅ meta.confidence が undefined になることを防ぐ
    const newConfidence = Math.max(base.confidence ?? 0.8, 0.9)
    r.meta = { ...(r.meta || {}), parser: "seven", confidence: newConfidence }

    return {
      receipt: r,
      confidence: newConfidence, // ✅ 常に number を返す
      parser: "seven",
      warnings: r.meta?.warnings ?? [],
    }
  }
}
