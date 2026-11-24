export const STOCK_MAX = 10

function wholeNumber(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.round(n)
}

export function clampStock(value: unknown) {
  const n = wholeNumber(value)
  if (n === null || n < 0) return 0
  return Math.min(STOCK_MAX, n)
}

export function clampPrice(value: unknown) {
  const n = wholeNumber(value)
  if (n === null || n < 0) return 0
  return n
}

export function stockCap(stock: number) {
  return Math.min(STOCK_MAX, Math.max(0, stock))
}
