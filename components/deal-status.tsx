import { t, type MessageKey } from "@/lib/i18n"
import type { Lang, Order, OrderStatus } from "@/lib/types"

const rank: Record<OrderStatus, number> = { placed: 0, paid: 1, shipped: 2, completed: 3, cancelled: -1 }

export function DealStatus({ order, lang }: { order: Order; lang: Lang }) {
  const steps: MessageKey[] = ["waitingPay", "paymentConfirmed", order.fulfillment === "delivery" ? "shipped" : "readyPickup", "completed"]
  const current = rank[order.status]
  return (
    <section className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] px-4 py-3">
      {order.status === "cancelled" ? (
        <p className="text-sm font-bold text-[#8c3a32]">{t(lang, "cancelled")}</p>
      ) : (
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step}
              className={`rounded-full px-2 py-1 text-center text-xs font-bold sm:text-sm ${current >= index ? "bg-[#0e1c33] text-white" : "bg-[#efe2c8] text-[#6d4e16]"}`}
            >
              {t(lang, step)}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-2 text-sm text-[#5b6577]">{order.fulfillment === "delivery" ? t(lang, "delivery") : t(lang, "pickup")}</p>
    </section>
  )
}
