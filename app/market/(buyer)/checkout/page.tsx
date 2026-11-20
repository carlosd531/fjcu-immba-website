import { placeOrder } from "@/lib/actions"
import { one } from "@/lib/catalog"
import { DELIVERY_FEE, SERVICE_FEE } from "@/lib/fees"
import { money, pickText } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/auth"
import type { MessageKey } from "@/lib/i18n"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [lang, profile, query] = await Promise.all([getLang(), getProfile(), searchParams])
  if (!profile) redirect("/market/login")
  const supabase = await createClient()
  const { data } = await supabase
    .from("cart_items")
    .select("quantity, products(title_en, title_zh, price, seller_name, seller_id)")
    .eq("user_id", profile.id)
  const rows = (data || [])
    .map((row) => ({ quantity: row.quantity, product: one(row.products) }))
    .filter((row) => row.product)
  const sellers = new Set(rows.map((row) => row.product!.seller_id))
  const items = rows.reduce((sum, row) => sum + row.quantity * row.product!.price, 0)
  const purchases = Math.max(sellers.size, 1)
  const service = SERVICE_FEE * purchases
  const delivery = DELIVERY_FEE * purchases
  const errorKey = query.error === "errorStock" || query.error === "errorForbidden" || query.error === "errorGeneric" || query.error === "errorOwnListing" ? query.error : ""

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-5xl">{t(lang, "checkoutTitle")}</h1>
      <p className="mt-3 text-[#5b6577]">{t(lang, "checkoutNote")}</p>
      <p className="mt-2 text-sm font-semibold text-[#6d4e16]">{t(lang, "feeNote")}</p>
      {errorKey ? <p className="mt-3 font-semibold text-[#8c3a32]">{t(lang, errorKey as MessageKey)}</p> : null}
      {rows.length === 0 ? <p className="mt-6">{t(lang, "emptyCart")}</p> : (
        <form action={placeOrder} className="mt-6 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-5">
          <input type="hidden" name="checkout_key" value={crypto.randomUUID()} />
          <ul className="space-y-3">
            {rows.map((row, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>{pickText(lang, row.product!.title_en, row.product!.title_zh)} × {row.quantity}<br /><span className="text-sm text-[#5b6577]">{row.product!.seller_name}</span></span>
                <b>{money(row.product!.price * row.quantity, lang)}</b>
              </li>
            ))}
          </ul>
          <fieldset className="mt-5 space-y-3">
            <legend className="font-display text-3xl">{t(lang, "shippingTitle")}</legend>
            <label className="flex items-start justify-between gap-3 rounded-xl border border-[#e4e0d8] p-3">
              <span className="flex gap-2"><input type="radio" name="fulfillment" value="pickup" defaultChecked /> <span><b>{t(lang, "pickup")}</b><br /><span className="text-sm text-[#5b6577]">{t(lang, "pickupFree")}</span></span></span>
              <b>{money(items + service, lang)}</b>
            </label>
            <label className="flex items-start justify-between gap-3 rounded-xl border border-[#e4e0d8] p-3">
              <span className="flex gap-2"><input type="radio" name="fulfillment" value="delivery" /> <span><b>{t(lang, "delivery")}</b><br /><span className="text-sm text-[#5b6577]">{money(DELIVERY_FEE, lang)}</span></span></span>
              <b>{money(items + service + delivery, lang)}</b>
            </label>
          </fieldset>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt>{t(lang, "total")}</dt><dd>{money(items, lang)}</dd></div>
            <div className="flex justify-between"><dt>{t(lang, "serviceFee")} · {money(SERVICE_FEE, lang)} × {purchases}</dt><dd>{money(service, lang)}</dd></div>
            <div className="flex justify-between"><dt>{t(lang, "deliveryFee")}</dt><dd>{t(lang, "pickupFree")} / {money(delivery, lang)}</dd></div>
          </dl>
          <button className="mt-5 h-11 rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "payNow")}</button>
        </form>
      )}
    </div>
  )
}
