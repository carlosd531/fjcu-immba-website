import Link from "next/link"
import { DealStatus } from "@/components/deal-status"
import { requireSeller } from "@/lib/guard"
import { money, pickText, when } from "@/lib/format"
import { t, type MessageKey } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { loadOrders, orderTotal } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const profile = await requireSeller()
  const lang = await getLang()
  const orders = await loadOrders("seller_id", profile.id)
  const completed = orders.filter((order) => order.status === "completed")
  const pendingPay = orders.filter((order) => order.status === "placed").length
  const readyShip = orders.filter((order) => order.status === "paid").length
  const total = completed.reduce((sum, order) => sum + orderTotal(order), 0)
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl">{t(lang, "salesTitle")}</h1>
        {completed.length > 0 ? (
          <a href="/market/sell/sales/export" className="inline-flex h-11 items-center rounded-full border border-[#0e1c33] px-5 font-bold">{t(lang, "exportCsv")}</a>
        ) : null}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [pendingPay, "pendingPayCount"],
          [readyShip, "readyShipCount"],
          [completed.length, "salesCount"],
          [money(total, lang), "completedRevenue"],
        ].map(([value, key]) => (
          <div key={String(key)} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
            <b className="block font-display text-3xl">{value}</b>
            <span className="text-sm text-[#5b6577]">{t(lang, key as MessageKey)}</span>
          </div>
        ))}
      </div>
      {completed.length === 0 ? <p className="mt-6 text-[#5b6577]">{t(lang, "emptySales")}</p> : (
        <ul className="mt-6 space-y-3">
          {completed.map((order) => (
            <li key={order.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <DealStatus order={order} lang={lang} />
              <div className="flex justify-between gap-3">
                <span>{order.order_items.map((item) => pickText(lang, item.title_en, item.title_zh)).join(", ")}</span>
                <b>{money(orderTotal(order), lang)}</b>
              </div>
              <p className="text-sm text-[#5b6577]">{t(lang, "fulfilled")} · {when(order.completed_at || order.paid_at || order.created_at, lang)}</p>
            </li>
          ))}
        </ul>
      )}
      {readyShip > 0 ? (
        <p className="mt-6 text-sm">
          <Link href="/market/sell/orders" className="font-bold underline">{t(lang, "incoming")}</Link>
        </p>
      ) : null}
    </div>
  )
}
