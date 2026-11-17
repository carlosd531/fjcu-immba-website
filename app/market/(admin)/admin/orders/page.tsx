import { money, pickText, when } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { orderTotal } from "@/lib/orders"
import { createClient } from "@/lib/supabase/server"
import type { MessageKey } from "@/lib/i18n"
import type { Order } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const [lang, supabase] = await Promise.all([getLang(), createClient()])
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(id, title_en, title_zh, unit_price, quantity, product_id)")
    .order("created_at", { ascending: false })
  const orders = (data || []) as Order[]
  const ids = [...new Set(orders.flatMap((order) => [order.buyer_id, order.seller_id]))]
  const { data: people } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] }
  const names = new Map((people || []).map((person) => [person.id, person.full_name]))
  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "transactions")}</h1>
      <p className="mt-2 text-sm text-[#5b6577]">{t(lang, "monitorNote")}</p>
      {orders.length === 0 ? <p className="mt-6">{t(lang, "emptyOrders")}</p> : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <b>{t(lang, order.status as MessageKey)}</b>
                <span className="text-sm text-[#5b6577]">{when(order.created_at, lang)}</span>
              </div>
              <p className="mt-1 text-sm">{names.get(order.buyer_id)} → {names.get(order.seller_id)}</p>
              <p className="mt-1">{order.order_items.map((item) => pickText(lang, item.title_en, item.title_zh)).join(", ")}</p>
              <p className="mt-1 font-bold">{money(orderTotal(order), lang)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
