import Link from "next/link"
import { t, type MessageKey } from "@/lib/i18n"
import type { Lang, Order, OrderStatus } from "@/lib/types"

const rank: Record<OrderStatus, number> = { placed: 0, paid: 1, shipped: 2, completed: 3, cancelled: -1 }

export function DealStatus({
  order,
  role,
  lang,
  linked = true,
}: {
  order: Order | null
  role: "buyer" | "seller"
  lang: Lang
  linked?: boolean
}) {
  const href = role === "buyer" ? (order ? `/market/orders/${order.id}` : "/market/orders") : "/market/sell/orders"
  const title = t(lang, role === "buyer" ? "statusPurchase" : "statusSale")
  if (!order) {
    return (
      <section className="mb-6 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] px-4 py-3">
        <p className="text-xs font-bold tracking-wide text-[#b68a3d] uppercase">{title}</p>
        <p className="mt-1 text-sm text-[#5b6577]">{t(lang, role === "buyer" ? "noPurchase" : "noSale")}</p>
      </section>
    )
  }
  const steps: MessageKey[] = ["placed", "paid", order.fulfillment === "delivery" ? "delivered" : "readyPickup", "completed"]
  const current = rank[order.status]
  return (
    <section className="mb-6 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-wide text-[#b68a3d] uppercase">{title}</p>
        {linked ? <Link href={href} className="text-sm font-bold text-[#0e1c33] underline">{t(lang, role === "buyer" ? "orders" : "incoming")}</Link> : null}
      </div>
      {order.status === "cancelled" ? (
        <p className="mt-2 text-sm font-bold text-[#8c3a32]">{t(lang, "cancelled")}</p>
      ) : (
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((step, index) => {
            const done = current >= index
            return (
              <li key={step} className={`rounded-full px-2 py-1 text-center text-xs font-bold sm:text-sm ${done ? "bg-[#0e1c33] text-white" : "bg-[#efe2c8] text-[#6d4e16]"}`}>
                {t(lang, step)}
              </li>
            )
          })}
        </ol>
      )}
      <p className="mt-2 text-sm text-[#5b6577]">{order.fulfillment === "delivery" ? t(lang, "delivery") : t(lang, "pickup")}</p>
    </section>
  )
}
