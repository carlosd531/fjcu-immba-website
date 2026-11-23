import { redirect } from "next/navigation"
import { getProfile } from "@/lib/auth"
import { homeFor } from "@/lib/format"
import { canBuy, canSell, isMarketAdmin } from "@/lib/roles"
import type { Profile } from "@/lib/types"

export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect("/market/login")
  return profile
}

export async function requireBuyer(): Promise<Profile> {
  const profile = await requireProfile()
  if (!canBuy(profile)) redirect(homeFor(profile.role))
  return profile
}

export async function requireSeller(): Promise<Profile> {
  const profile = await requireProfile()
  if (!canSell(profile)) redirect(homeFor(profile.role))
  return profile
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile()
  if (!isMarketAdmin(profile)) redirect(homeFor(profile.role))
  return profile
}
