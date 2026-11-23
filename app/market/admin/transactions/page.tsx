import { money, pickText, when } from "@/lib/format"
import { requireAdmin } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { orderTotal } from "@/lib/orders"
import { createClient } from "@/lib/supabase/server"
import type { MessageKey } from "@/lib/i18n"
import type { Order, OrderStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

const statuses: OrderStatus[] = ["placed", "paid", "shipped", "completed", "cancelled"]

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>
}) {
  await requireAdmin()
  const [lang, supabase, query] = await Promise.all([getLang(), createClient(), searchParams])
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(id, title_en, title_zh, unit_price, quantity, product_id)")
    .order("created_at", { ascending: false })
  const ids = [...new Set((data || []).flatMap((order) => [order.buyer_id, order.seller_id]))]
  const { data: people } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] }
  const names = new Map((people || []).map((person) => [person.id, person.full_name]))
  const needle = (query.q || "").trim().toLowerCase()
  const from = query.from ? Date.parse(query.from) : NaN
  const to = query.to ? Date.parse(`${query.to}T23:59:59`) : NaN
  const orders = ((data || []) as Order[]).filter((order) => {
    if (query.status && statuses.includes(query.status as OrderStatus) && order.status !== query.status) return false
    const created = Date.parse(order.created_at)
    if (!Number.isNaN(from) && created < from) return false
    if (!Number.isNaN(to) && created > to) return false
    if (!needle) return true
    const hay = [
      order.id,
      order.buyer_name,
      names.get(order.buyer_id),
      names.get(order.seller_id),
      order.status,
      ...(order.order_items || []).flatMap((item) => [item.title_en, item.title_zh]),
    ].join(" ").toLowerCase()
    return hay.includes(needle)
  })
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl">{t(lang, "transactions")}</h1>
        <a href="/market/admin/transactions/export" className="inline-flex h-11 items-center rounded-full bg-[#0e1c33] px-5 font-bold text-white">{t(lang, "exportSalesReport")}</a>
      </div>
      <p className="mt-2 text-sm text-[#5b6577]">{t(lang, "monitorNote")}</p>
      <p className="mt-1 text-sm text-[#5b6577]">{t(lang, "exportSalesNote")}</p>
      <form className="mt-6 grid gap-3 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-bold">
          {t(lang, "order")}
          <select name="status" defaultValue={query.status || ""} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3">
            <option value="">{t(lang, "none")}</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{t(lang, status)}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          {t(lang, "search")}
          <input name="q" defaultValue={query.q || ""} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
        </label>
        <label className="text-sm font-bold">
          {t(lang, "dateFrom")}
          <input name="from" type="date" defaultValue={query.from || ""} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
        </label>
        <label className="text-sm font-bold">
          {t(lang, "dateTo")}
          <input name="to" type="date" defaultValue={query.to || ""} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
        </label>
        <button className="h-11 self-end rounded-full bg-[#0e1c33] px-5 font-bold text-white">{t(lang, "filter")}</button>
      </form>
      {orders.length === 0 ? <p className="mt-6">{t(lang, "emptyOrders")}</p> : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <b>{t(lang, order.status as MessageKey)}</b>
                <span className="text-sm text-[#5b6577]">{when(order.created_at, lang)}</span>
              </div>
              <p className="mt-1 text-sm">{names.get(order.buyer_id)} → {names.get(order.seller_id)}</p>
              <p className="mt-1">{(order.order_items || []).map((item) => pickText(lang, item.title_en, item.title_zh)).join(", ")}</p>
              <p className="mt-1 font-bold">{money(orderTotal(order), lang)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
