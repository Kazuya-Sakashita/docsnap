// src/lib/receipt/normalize.ts
export const norm = {
  z2h: (s: string) => s.normalize("NFKC"),
  strip: (s: string) => s.replace(/[ \t\u3000]+/g, " ").trim(),
  yenToNum: (s: string) => Number(s.replace(/[^\d-]/g, "")) || 0,
  numSafe: (s?: string) => (s ? Number(s.replace(/[^\d.-]/g, "")) || null : null),
  dateCandidates: (s: string): string | null => {
    const t = s.replace(/\s/g, "")
    const m1 = t.match(/(\d{4})[/\-年](\d{1,2})[/\-月](\d{1,2})日?/)
    if (m1) {
      const [_, y, mo, d] = m1
      return new Date(Number(y), Number(mo) - 1, Number(d)).toISOString()
    }
    return null
  },
}
