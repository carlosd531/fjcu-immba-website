import { getProfile } from "@/lib/auth"
import { money, pickText, when } from "@/lib/format"
import { t, type MessageKey } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { loadOrders, orderTotal } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const [lang, profile] = await Promise.all([getLang(), getProfile()])
  const paid = (await loadOrders("seller_id", profile!.id)).filter((order) => order.status === "paid" || order.status === "shipped")
  const total = paid.reduce((sum, order) => sum + orderTotal(order), 0)
  const fulfilled = paid.filter((order) => order.status === "shipped").length
  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "salesTitle")}</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          [paid.length, "salesCount"],
          [money(total, lang), "salesTotal"],
          [fulfilled, "fulfilled"],
        ].map(([value, key]) => (
          <div key={String(key)} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
            <b className="block font-display text-3xl">{value}</b>
            <span className="text-sm text-[#5b6577]">{t(lang, key as MessageKey)}</span>
          </div>
        ))}
      </div>
      {paid.length === 0 ? <p className="mt-6 text-[#5b6577]">{t(lang, "emptySales")}</p> : (
        <ul className="mt-6 space-y-3">
          {paid.map((order) => (
            <li key={order.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <div className="flex justify-between gap-3">
                <span>{order.order_items.map((item) => pickText(lang, item.title_en, item.title_zh)).join(", ")}</span>
                <b>{money(orderTotal(order), lang)}</b>
              </div>
              <p className="text-sm text-[#5b6577]">{order.status === "shipped" ? t(lang, "fulfilled") : t(lang, "openSale")} · {when(order.paid_at || order.created_at, lang)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
