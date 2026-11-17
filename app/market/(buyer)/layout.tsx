import { redirect } from "next/navigation"
import { getProfile } from "@/lib/auth"
import { homeFor } from "@/lib/format"

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (profile?.role !== "buyer") redirect(homeFor(profile?.role))
  return children
}
