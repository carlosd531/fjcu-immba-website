import { notFound } from "next/navigation"
import { DealStatus } from "@/components/deal-status"
import { advanceOrder, cancelOrder } from "@/lib/actions"
import { getProfile } from "@/lib/auth"
import { money, pickText, when } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { loadOrder, orderTotal } from "@/lib/orders"
import type { MessageKey } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ id }, query, lang, profile] = await Promise.all([params, searchParams, getLang(), getProfile()])
  const order = await loadOrder(id)
  if (!order || order.buyer_id !== profile?.id) notFound()
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-bold text-[#b68a3d]">{t(lang, order.status as MessageKey)}</p>
      <h1 className="font-display text-5xl">{t(lang, "order")}</h1>
      <p className="text-sm text-[#5b6577]">{when(order.created_at, lang)}</p>
      {query.error ? <p className="mt-3 font-semibold text-[#8c3a32]">{t(lang, "errorForbidden")}</p> : null}
      <DealStatus order={order} role="buyer" lang={lang} />
      <ul className="mt-6 space-y-3 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-5">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>{pickText(lang, item.title_en, item.title_zh)} × {item.quantity}</span>
            <b>{money(item.unit_price * item.quantity, lang)}</b>
          </li>
        ))}
        <li className="flex justify-between text-sm"><span>{t(lang, "serviceFee")}</span><b>{money(order.service_fee || 0, lang)}</b></li>
        <li className="flex justify-between text-sm"><span>{t(lang, "deliveryFee")}</span><b>{money(order.delivery_fee || 0, lang)}</b></li>
        <li className="flex justify-between border-t border-[#e4e0d8] pt-3 font-display text-3xl">
          <span>{t(lang, "total")}</span>
          <span>{money(orderTotal(order), lang)}</span>
        </li>
      </ul>
      {order.status === "placed" ? (
        <form action={cancelOrder} className="mt-4">
          <input type="hidden" name="order_id" value={order.id} />
          <button className="h-11 rounded-full border border-[#8c3a32] px-5 font-bold text-[#8c3a32]">{t(lang, "cancel")}</button>
        </form>
      ) : null}
      {order.status === "shipped" ? (
        <form action={advanceOrder} className="mt-4">
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="status" value="completed" />
          <button className="h-11 rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "markCompleted")}</button>
        </form>
      ) : null}
    </div>
  )
}
