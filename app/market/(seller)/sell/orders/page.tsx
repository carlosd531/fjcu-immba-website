import { DealStatus } from "@/components/deal-status"
import { advanceOrder } from "@/lib/actions"
import { getProfile } from "@/lib/auth"
import { money, pickText, when } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { loadOrders, orderTotal } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [lang, profile, query] = await Promise.all([getLang(), getProfile(), searchParams])
  const orders = await loadOrders("seller_id", profile!.id)
  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "incoming")}</h1>
      {query.error ? <p className="mt-3 font-semibold text-[#8c3a32]">{t(lang, "errorForbidden")}</p> : null}
      {orders.length === 0 ? <p className="mt-6 text-[#5b6577]">{t(lang, "emptyOrders")}</p> : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <DealStatus order={order} role="seller" lang={lang} />
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-sm text-[#5b6577]">{order.buyer_name} · {when(order.created_at, lang)}</span>
              </div>
              <ul className="mt-2 text-sm">
                {order.order_items.map((item) => <li key={item.id}>{pickText(lang, item.title_en, item.title_zh)} × {item.quantity}</li>)}
              </ul>
              <p className="mt-2 font-bold">{money(orderTotal(order), lang)}</p>
              {order.status === "placed" || order.status === "paid" || order.status === "shipped" ? (
                <form action={advanceOrder} className="mt-3">
                  <input type="hidden" name="order_id" value={order.id} />
                  <input type="hidden" name="status" value={order.status === "placed" ? "paid" : order.status === "paid" ? "shipped" : "completed"} />
                  <button className="h-10 rounded-full bg-[#0e1c33] px-4 text-sm font-bold text-white">{t(lang, order.status === "placed" ? "confirmPay" : order.status === "paid" ? (order.fulfillment === "pickup" ? "markReady" : "ship") : "markCompleted")}</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
