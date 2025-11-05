/**
 * 金額を日本円形式でフォーマット（桁区切り）
 */
export function formatCurrency(amount: number, currency = "JPY"): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * 金額を等幅フォントで表示するための数値フォーマット
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ja-JP").format(amount)
}

/**
 * 日付を YYYY/MM/DD 形式でフォーマット
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}/${month}/${day}`
}

/**
 * 日時を YYYY/MM/DD HH:mm 形式でフォーマット
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const dateStr = formatDate(d)
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${dateStr} ${hours}:${minutes}`
}
