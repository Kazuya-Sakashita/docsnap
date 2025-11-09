// src/lib/fetcher.ts
export const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json()
  })
