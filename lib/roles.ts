import type { Profile } from "@/lib/types"

export function canBuy(profile: Profile | null | undefined): profile is Profile {
  return profile?.role === "buyer" || profile?.role === "seller"
}

export function canSell(profile: Profile | null | undefined): profile is Profile {
  return profile?.role === "seller"
}

export function isMarketAdmin(profile: Profile | null | undefined): profile is Profile {
  return profile?.role === "admin"
}
