import Link from "next/link"
import { DealStatus } from "@/components/deal-status"
import { getProfile } from "@/lib/auth"
import { money, pickText, when } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { loadOrders, orderTotal } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const [lang, profile] = await Promise.all([getLang(), getProfile()])
  const orders = await loadOrders("buyer_id", profile!.id)
  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "ordersTitle")}</h1>
      {orders.length === 0 ? <p className="mt-6 text-[#5b6577]">{t(lang, "emptyOrders")}</p> : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/market/orders/${order.id}`} className="block rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <DealStatus order={order} role="buyer" lang={lang} linked={false} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-[#5b6577]">{when(order.created_at, lang)}</span>
              </div>
              <p className="mt-2">{order.order_items.map((item) => pickText(lang, item.title_en, item.title_zh)).join(", ")}</p>
              <p className="mt-1 font-bold">{money(orderTotal(order), lang)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
