import type { OcrMode, OcrResponse } from "@/components/scan/types"

export async function runOcr(file: File, mode: OcrMode = "document"): Promise<OcrResponse> {
  const fd = new FormData()
  fd.append("file", file)

  const res = await fetch(`/api/ocr?mode=${mode}`, {
    method: "POST",
    body: fd,
  })

  const json = await res.json()
  if (!res.ok) {
    const reason = json?.error || "OCR failed"
    throw new Error(reason)
  }
  return json as OcrResponse
}
