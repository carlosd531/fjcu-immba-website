import Link from "next/link"
import { DealStatus } from "@/components/deal-status"
import { money, pickText, when } from "@/lib/format"
import { requireBuyer } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { loadOrders, orderTotal } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const profile = await requireBuyer()
  const lang = await getLang()
  const orders = await loadOrders("buyer_id", profile.id)
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl">{t(lang, "ordersTitle")}</h1>
        {orders.length > 0 ? (
          <a href="/market/orders/export" className="inline-flex h-11 items-center rounded-full border border-[#0e1c33] px-5 font-bold">{t(lang, "exportPurchases")}</a>
        ) : null}
      </div>
      {orders.length === 0 ? <p className="mt-6 text-[#5b6577]">{t(lang, "emptyOrders")}</p> : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/market/orders/${order.id}`} className="block rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <DealStatus order={order} lang={lang} />
              <p className="mt-3 text-sm text-[#5b6577]">{t(lang, "sellerLabel")}: {order.seller_name || "—"}</p>
              <p className="mt-1 text-sm text-[#5b6577]">{when(order.created_at, lang)}</p>
              <p className="mt-2">{order.order_items.map((item) => pickText(lang, item.title_en, item.title_zh)).join(", ")}</p>
              <p className="mt-1 font-bold">{money(orderTotal(order), lang)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
