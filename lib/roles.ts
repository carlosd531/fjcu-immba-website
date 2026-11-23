import type { Profile } from "@/lib/types"

export function canBuy(profile: Profile | null | undefined) {
  return profile?.role === "buyer"
}

export function canSell(profile: Profile | null | undefined) {
  return profile?.role === "seller"
}

export function isMarketAdmin(profile: Profile | null | undefined) {
  return profile?.role === "admin"
}
