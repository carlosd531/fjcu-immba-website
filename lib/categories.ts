import type { Category } from "@/lib/types"
import type { MessageKey } from "@/lib/i18n"

export const CATEGORIES: Category[] = ["school", "home", "personal_use", "others"]

export function isCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category)
}

export function categoryLabelKey(value: string): MessageKey {
  if (value === "personal_use" || value === "electronics") return "personalUse"
  if (value === "books") return "school"
  if (value === "school" || value === "home" || value === "others") return value
  return "others"
}
