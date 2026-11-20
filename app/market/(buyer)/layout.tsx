import { redirect } from "next/navigation"
import { DealStatus } from "@/components/deal-status"
import { getProfile } from "@/lib/auth"
import { homeFor } from "@/lib/format"
import { getLang } from "@/lib/lang"
import { loadOrders } from "@/lib/orders"

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (profile?.role !== "buyer") redirect(homeFor(profile?.role))
  const [lang, orders] = await Promise.all([getLang(), loadOrders("buyer_id", profile.id)])
  const current = orders.find((order) => order.status === "placed" || order.status === "paid") || orders[0] || null
  return (
    <>
      <DealStatus order={current} role="buyer" lang={lang} />
      {children}
    </>
  )
}
