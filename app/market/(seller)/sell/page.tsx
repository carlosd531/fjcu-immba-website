import Link from "next/link"
import { setStock } from "@/lib/actions"
import { getProfile } from "@/lib/auth"
import { imageUrls } from "@/lib/catalog"
import { money, pickText } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function SellPage() {
  const [lang, profile] = await Promise.all([getLang(), getProfile()])
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(id, storage_path, sort_order)")
    .eq("seller_id", profile!.id)
    .order("created_at", { ascending: false })
  const products = (data || []) as Product[]
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl">{t(lang, "productsTitle")}</h1>
        <Link href="/market/sell/new" className="inline-flex h-11 items-center rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "addProduct")}</Link>
      </div>
      {products.length === 0 ? <p className="mt-6 text-[#5b6577]">{t(lang, "emptyProducts")}</p> : (
        <div className="mt-6 space-y-4">
          {products.map((product) => {
            const photo = imageUrls(product.product_images)[0]
            return (
              <article key={product.id} className="flex flex-col gap-4 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4 sm:flex-row">
                {photo ? <img src={photo} alt="" className="h-28 w-full rounded-xl object-cover sm:w-36" /> : <div className="h-28 rounded-xl bg-[#efe2c8] sm:w-36" />}
                <div className="flex-1">
                  <h2 className="font-display text-2xl">{pickText(lang, product.title_en, product.title_zh)}</h2>
                  <p className="text-sm text-[#5b6577]">{money(product.price, lang)} · {product.stock > 0 ? t(lang, "inStock", { n: product.stock }) : t(lang, "outOfStock")}</p>
                  {product.stock <= 1 ? <p className="text-sm font-bold text-[#8c3a32]">{t(lang, "lowStock")}</p> : null}
                  <form action={setStock} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="id" value={product.id} />
                    <label className="text-sm font-bold">{t(lang, "setStock")}</label>
                    <input name="stock" type="number" min={0} defaultValue={product.stock} className="h-10 w-20 rounded-xl border border-[#e4e0d8] px-2" />
                    <button className="h-10 rounded-full bg-[#0e1c33] px-3 text-sm font-bold text-white">{t(lang, "save")}</button>
                  </form>
                </div>
                <Link href={`/market/sell/${product.id}`} className="self-start font-bold underline">{t(lang, "editProduct")}</Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
