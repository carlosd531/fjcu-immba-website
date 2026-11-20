import { redirect } from "next/navigation"
import { DealStatus } from "@/components/deal-status"
import { getProfile } from "@/lib/auth"
import { homeFor } from "@/lib/format"
import { getLang } from "@/lib/lang"
import { loadOrders } from "@/lib/orders"

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (profile?.role !== "seller") redirect(homeFor(profile?.role))
  const [lang, orders] = await Promise.all([getLang(), loadOrders("seller_id", profile.id)])
  const current = orders.find((order) => order.status === "placed" || order.status === "paid" || order.status === "shipped") || orders[0] || null
  return (
    <>
      <DealStatus order={current} role="seller" lang={lang} />
      {children}
    </>
  )
}
