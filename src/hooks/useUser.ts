// src/hooks/useUser.ts
import useSWR from "swr"

type SessionResponse = { user: { id: string; email: string | null } | null }
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "same-origin" })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useUser() {
  const { data, error, mutate, isLoading, isValidating } = useSWR<SessionResponse>(
    "/api/session",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        console.debug("[SWR:user] success:", data)
      },
      onError: (err) => {
        console.error("[SWR:user] error:", err)
      },
    },
  )

  return {
    user: data?.user ?? null,
    loading: isLoading,
    error,
    isValidating,
    mutate,
  }
}
