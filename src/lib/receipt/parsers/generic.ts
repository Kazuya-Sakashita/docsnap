// src/lib/receipt/parsers/generic.ts
import { norm } from "../normalize"
import type { ReceiptParser, ParseContext, ParseResult } from "../parser"
import type { NormalizedReceipt, ReceiptItem } from "@/components/receipt/types"

const RX_AMOUNT = /(?:¥|\\uFFE5)?\s*([-]?\d{1,3}(?:,\d{3})*|\d+)\s*(?:円)?$/
const RX_QTY = /(?:×|x|\*)\s*(\d+)\b/
const RX_UNIT = /@?\s?(\d{1,3}(?:,\d{3})*|\d+)\s*(?:円)?/

export class GenericParser implements ReceiptParser {
  detect({ text }: ParseContext): number {
    const t = norm.z2h(text)
    const hints = [/合計/, /お預り/, /お釣り/, /小計/].filter((rx) => rx.test(t)).length
    return Math.min(0.6, 0.2 + hints * 0.15)
  }

  parse(ctx: ParseContext): ParseResult {
    const lines = ctx.lines.map((l) => norm.strip(norm.z2h(l))).filter(Boolean)

    const items: ReceiptItem[] = []
    const warnings: string[] = []

    for (const line of lines) {
      if (/(小計|合計|お預り|お釣り|税|内)/.test(line)) continue

      const mAmt = line.match(RX_AMOUNT)
      if (!mAmt) continue

      const totalNum = norm.yenToNum(mAmt[1])
      const total = Number.isFinite(totalNum) ? totalNum : null
      const left = line.replace(RX_AMOUNT, "").trim()

      const mQty = left.match(RX_QTY)
      const qty = mQty ? Number(mQty[1]) : 1 // ✅ 型に合わせて最低1

      const mUnit = left.match(RX_UNIT)
      const unitPrice = mUnit
        ? norm.yenToNum(mUnit[1])
        : total !== null && qty > 0
          ? Math.round(total / qty)
          : null

      const name = left
        .replace(RX_QTY, "")
        .replace(RX_UNIT, "")
        .replace(/\s{2,}/g, " ")
        .trim()

      items.push({
        name: name || "不明",
        qty, // ✅ number
        unitPrice, // number | null
        total, // number | null
        taxRate: null,
        raw: line,
      })
    }

    // 集計（まずは候補を集め、最後に0で埋める）
    const totalsCandidate = {
      subtotal8: null as number | null,
      tax8: null as number | null,
      subtotal10: null as number | null,
      tax10: null as number | null,
      grandTotal: null as number | null,
      paid: null as number | null,
      change: null as number | null,
    }

    for (const line of lines) {
      const n = norm.yenToNum(line)
      if (/合計/.test(line)) totalsCandidate.grandTotal = n
      else if (/お預り/.test(line)) totalsCandidate.paid = n
      else if (/お釣り/.test(line)) totalsCandidate.change = n
      else if (/小計.*8/.test(line)) totalsCandidate.subtotal8 = n
      else if (/小計.*10/.test(line)) totalsCandidate.subtotal10 = n
      else if (/消費税.*8/.test(line)) totalsCandidate.tax8 = n
      else if (/消費税.*10/.test(line)) totalsCandidate.tax10 = n
    }

    // ✅ 型に合わせて 0 でフォールバック
    const totals = {
      subtotal8: totalsCandidate.subtotal8 ?? 0,
      tax8: totalsCandidate.tax8 ?? 0,
      subtotal10: totalsCandidate.subtotal10 ?? 0,
      tax10: totalsCandidate.tax10 ?? 0,
      grandTotal: totalsCandidate.grandTotal ?? 0,
      paid: totalsCandidate.paid ?? 0,
      change: totalsCandidate.change ?? 0,
    }

    // ヘッダ
    const header = lines.slice(0, 8).join(" ")
    const purchasedAt = norm.dateCandidates(header) ?? new Date().toISOString() // ✅ string で保証

    const merchantName =
      header.match(
        /(セブン.?イレブン|ファミリーマート|ローソン|イオン|マツモトキヨシ|ドン・キホーテ|薬王堂|ウエルシア)/,
      )?.[1] || null

    const receipt: NormalizedReceipt = {
      merchant: { name: merchantName },
      purchasedAt, // ✅ string
      items,
      totals, // ✅ 全て number
      meta: { source: "ocr", parser: "generic", confidence: 0.7, warnings },
      // ※ types.ts に taxMode が無い場合は付けない（付けるなら型にも追加）
    }

    return { receipt, confidence: 0.7, warnings, parser: "generic" }
  }
}
