import { placeOrder } from "@/lib/actions"
import { one } from "@/lib/catalog"
import { money, pickText } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/auth"
import type { MessageKey } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [lang, profile, query] = await Promise.all([getLang(), getProfile(), searchParams])
  const supabase = await createClient()
  const { data } = await supabase
    .from("cart_items")
    .select("quantity, products(title_en, title_zh, price, seller_name, seller_id)")
    .eq("user_id", profile!.id)
  const rows = (data || [])
    .map((row) => ({ quantity: row.quantity, product: one(row.products) }))
    .filter((row) => row.product)
  const sellers = new Set(rows.map((row) => row.product!.seller_id))
  const total = rows.reduce((sum, row) => sum + row.quantity * row.product!.price, 0)
  const errorKey = query.error === "errorStock" || query.error === "errorForbidden" || query.error === "errorGeneric" ? query.error : ""

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-5xl">{t(lang, "checkoutTitle")}</h1>
      <p className="mt-3 text-[#5b6577]">{t(lang, "checkoutNote")}</p>
      {errorKey ? <p className="mt-3 font-semibold text-[#8c3a32]">{t(lang, errorKey as MessageKey)}</p> : null}
      {rows.length === 0 ? <p className="mt-6">{t(lang, "emptyCart")}</p> : (
        <form action={placeOrder} className="mt-6 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-5">
          <ul className="space-y-3">
            {rows.map((row, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>{pickText(lang, row.product!.title_en, row.product!.title_zh)} × {row.quantity}<br /><span className="text-sm text-[#5b6577]">{row.product!.seller_name}</span></span>
                <b>{money(row.product!.price * row.quantity, lang)}</b>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[#5b6577]">{sellers.size} {t(lang, "sellers").toLowerCase()}</p>
          <div className="mt-4 flex items-center justify-between">
            <b className="font-display text-3xl">{money(total, lang)}</b>
            <button className="h-11 rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "placeOrder")}</button>
          </div>
        </form>
      )}
    </div>
  )
}
