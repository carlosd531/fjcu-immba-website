import Link from "next/link"
import { removeCart, updateCart } from "@/lib/actions"
import { imageUrls, one } from "@/lib/catalog"
import { money, pickText } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import { requireBuyer } from "@/lib/guard"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const profile = await requireBuyer()
  const lang = await getLang()
  const supabase = await createClient()
  const { data } = await supabase
    .from("cart_items")
    .select("quantity, product_id, products(*, product_images(id, storage_path, sort_order))")
    .eq("user_id", profile.id)
  const rows = (data || []).map((row) => ({ ...row, product: one(row.products) }))
  const total = rows.reduce((sum, row) => sum + row.quantity * (row.product?.price || 0), 0)

  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "cartTitle")}</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-[#5b6577]">{t(lang, "emptyCart")} <Link className="font-bold underline" href="/market">{t(lang, "browse")}</Link></p>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((row) => {
            const product = row.product
            if (!product) return null
            const photo = imageUrls(product.product_images)[0]
            return (
              <div key={row.product_id} className="flex flex-col gap-4 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4 sm:flex-row">
                {photo ? <img src={photo} alt="" className="h-28 w-full rounded-xl object-cover sm:w-36" /> : <div className="h-28 rounded-xl bg-[#efe2c8] sm:w-36" />}
                <div className="flex-1">
                  <h2 className="font-display text-2xl">{pickText(lang, product.title_en, product.title_zh)}</h2>
                  <p className="text-sm text-[#5b6577]">{product.seller_name} · {money(product.price, lang)} · {product.stock > 0 ? t(lang, "inStock", { n: product.stock }) : t(lang, "outOfStock")}</p>
                  <form action={updateCart} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="product_id" value={row.product_id} />
                    <input name="quantity" type="number" min={1} max={product.stock} defaultValue={row.quantity} className="h-10 w-20 rounded-xl border border-[#e4e0d8] px-2" />
                    <button className="h-10 rounded-full border border-[#e4e0d8] px-3 text-sm font-bold">{t(lang, "update")}</button>
                  </form>
                </div>
                <form action={removeCart}>
                  <input type="hidden" name="product_id" value={row.product_id} />
                  <button className="h-10 rounded-full border border-[#8c3a32] px-3 text-sm font-bold text-[#8c3a32]">{t(lang, "remove")}</button>
                </form>
              </div>
            )
          })}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <b className="font-display text-3xl">{t(lang, "total")} {money(total, lang)}</b>
              <p className="text-sm text-[#5b6577]">{t(lang, "feeNote")}</p>
            </div>
            <Link href="/market/checkout" className="inline-flex h-11 items-center rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "chooseShipping")}</Link>
          </div>
        </div>
      )}
    </div>
  )
}
