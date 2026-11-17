import type { Lang } from "./types"

export function pickText(lang: Lang, en: string, zh: string) {
  if (lang === "zh") return zh.trim() || en
  return en.trim() || zh
}

export function money(amount: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-TW" : "en-US", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function when(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-TW" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function homeFor(role: string | null | undefined) {
  if (role === "seller") return "/market/sell"
  if (role === "admin") return "/market/admin"
  return "/market"
}
