// src/lib/ocr.ts
import type {
  OcrMode,
  OcrResponse,
  OcrBlock,
  OcrExtractedSummary,
  MinimalNormalized,
  OcrImageInfo,
} from "@/components/scan/types"

type RawOcrJson = {
  mode?: string
  text?: string
  confidence?: number
  blocks?: unknown
  extracted?: unknown
  normalized?: unknown
  receipt?: unknown
  image?: unknown
}

function safeExtracted(extracted: unknown): OcrExtractedSummary | undefined {
  if (!extracted || typeof extracted !== "object") return undefined
  const obj = extracted as {
    storeName?: unknown
    purchaseDate?: unknown
    total?: unknown
    tax?: unknown
  }

  return {
    storeName:
      typeof obj.storeName === "string" || obj.storeName == null
        ? (obj.storeName ?? null)
        : null,
    purchaseDate:
      typeof obj.purchaseDate === "string" || obj.purchaseDate == null
        ? (obj.purchaseDate ?? null)
        : null,
    total: typeof obj.total === "number" || obj.total == null ? (obj.total ?? null) : null,
    tax: typeof obj.tax === "number" || obj.tax == null ? (obj.tax ?? null) : null,
  }
}

function safeMinimalNormalized(src: unknown): MinimalNormalized | null {
  if (!src || typeof src !== "object") return null

  const obj = src as {
    merchant?: { name?: unknown } | null
    purchasedAt?: unknown
    totals?: { grandTotal?: unknown } | null
  }

  const merchant =
    obj.merchant && typeof obj.merchant === "object"
      ? {
          name:
            typeof obj.merchant.name === "string" || obj.merchant.name == null
              ? (obj.merchant.name ?? null)
              : null,
        }
      : undefined

  const purchasedAt =
    typeof obj.purchasedAt === "string" || obj.purchasedAt == null
      ? (obj.purchasedAt ?? null)
      : null

  const totals =
    obj.totals && typeof obj.totals === "object"
      ? {
          grandTotal:
            typeof obj.totals.grandTotal === "number" ||
            typeof obj.totals.grandTotal === "string" ||
            obj.totals.grandTotal == null
              ? (obj.totals.grandTotal ?? null)
              : null,
        }
      : undefined

  return { merchant, purchasedAt, totals }
}

function safeBlocks(rawBlocks: unknown): OcrBlock[] | undefined {
  if (!Array.isArray(rawBlocks)) return undefined

  const blocks: OcrBlock[] = rawBlocks
    .map((b): OcrBlock | null => {
      if (!b || typeof b !== "object") return null

      const anyBlock = b as { bbox?: unknown; text?: unknown }

      const rawBbox = Array.isArray(anyBlock.bbox) ? anyBlock.bbox : []
      const bbox = rawBbox
        .map((v): { x: number; y: number } | null => {
          if (!v || typeof v !== "object") return null
          const anyV = v as { x?: unknown; y?: unknown }
          const x = typeof anyV.x === "number" ? anyV.x : 0
          const y = typeof anyV.y === "number" ? anyV.y : 0
          return { x, y }
        })
        .filter((v): v is { x: number; y: number } => v !== null)

      const text = typeof anyBlock.text === "string" ? anyBlock.text : ""

      return { bbox, text }
    })
    .filter((b): b is OcrBlock => b !== null)

  return blocks.length ? blocks : undefined
}

function safeImage(raw: unknown): OcrImageInfo | undefined {
  if (!raw || typeof raw !== "object") return undefined
  const obj = raw as {
    path?: unknown
    url?: unknown
    mimeType?: unknown
    width?: unknown
    height?: unknown
    sha256?: unknown
    page?: unknown
  }

  if (typeof obj.path !== "string" || typeof obj.url !== "string") return undefined

  return {
    path: obj.path,
    url: obj.url,
    mimeType: typeof obj.mimeType === "string" ? obj.mimeType : undefined,
    width: typeof obj.width === "number" ? obj.width : undefined,
    height: typeof obj.height === "number" ? obj.height : undefined,
    sha256: typeof obj.sha256 === "string" ? obj.sha256 : undefined,
    page: typeof obj.page === "number" ? obj.page : undefined,
  }
}

export async function runOcr(
  file: File,
  mode: OcrMode = "document",
): Promise<OcrResponse> {
  const fd = new FormData()
  fd.append("file", file)

  const res = await fetch(`/api/ocr?mode=${mode}`, {
    method: "POST",
    body: fd,
  })

  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new Error("OCR API のレスポンスのパースに失敗しました")
  }

  // --- エラーレスポンス処理 ---
  if (!res.ok) {
    const err =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof (json as { error?: unknown }).error === "string"
        ? (json as { error?: string }).error
        : undefined

    throw new Error(err || `OCR failed (${res.status})`)
  }

  const data = json as RawOcrJson

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const minimal =
    safeMinimalNormalized(data.normalized) ??
    safeMinimalNormalized(data.receipt) ??
    null

  const response: OcrResponse = {
    id,
    mode: (data.mode ?? mode) as OcrMode,
    text: data.text ?? "",
    confidence:
      typeof data.confidence === "number" ? data.confidence : undefined,
    blocks: safeBlocks(data.blocks),
    extracted: safeExtracted(data.extracted),
    normalized: minimal,
    receipt: minimal,
    image: safeImage(data.image),
  }

  return response
}
