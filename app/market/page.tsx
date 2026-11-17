import Link from "next/link"
import { getProfile } from "@/lib/auth"
import { imageUrls, loadProducts } from "@/lib/catalog"
import { money, pickText } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import type { MessageKey } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const [{ q, category }, lang, profile] = await Promise.all([searchParams, getLang(), getProfile()])
  const [products, statsResult] = await Promise.all([loadProducts(q, category), (await createClient()).rpc("market_stats")])
  const stats = (statsResult.data || { listings: 0, sellers: 0, open_orders: 0 }) as {
    listings: number
    sellers: number
    open_orders: number
  }
  const categories: Array<"" | "books" | "electronics" | "home"> = ["", "books", "electronics", "home"]

  return (
    <div>
      {profile?.role === "pending" ? (
        <p className="mb-6 rounded-[18px] bg-[#efe2c8] px-4 py-3 text-sm font-semibold text-[#6d4e16]">
          {profile.request_status === "rejected"
            ? t(lang, "rejected")
            : profile.requested_role === "seller"
              ? t(lang, "pendingSeller")
              : t(lang, "pendingBuyer")}
        </p>
      ) : null}
      <p className="text-sm font-bold tracking-wide text-[#b68a3d] uppercase">{t(lang, !profile || profile.role === "pending" ? "visitor" : profile.role)}</p>
      <h1 className="mt-2 font-display text-5xl text-[#0e1c33]">{t(lang, "heroTitle")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-[#5b6577]">{t(lang, "heroLead")}</p>
      {!profile ? (
        <section className="mt-6 flex flex-col gap-3 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl">{t(lang, "startTitle")}</h2>
            <p className="mt-1 max-w-2xl text-[#5b6577]">{t(lang, "startLead")}</p>
          </div>
          <Link href="/market/login" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "signIn")}</Link>
        </section>
      ) : null}
      <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8]">
        {[
          [stats.listings, "listings"],
          [stats.sellers, "sellers"],
          [stats.open_orders, "openOrders"],
        ].map(([value, key]) => (
          <div key={String(key)} className="px-4 py-4">
            <b className="block font-display text-3xl">{value as number}</b>
            <span className="text-sm text-[#5b6577]">{t(lang, key as MessageKey)}</span>
          </div>
        ))}
      </div>
      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/">
        <input
          name="q"
          defaultValue={q}
          placeholder={t(lang, "search")}
          className="h-12 flex-1 rounded-full border border-[#e4e0d8] bg-white px-4"
        />
        <button className="h-12 rounded-full bg-[#0e1c33] px-5 font-bold text-white">{t(lang, "search")}</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <Link
            key={item || "all"}
            href={item ? `/?category=${item}` : "/"}
            className={`rounded-full px-3 py-1 text-sm font-bold ${category === item || (!category && !item) ? "bg-[#0e1c33] text-white" : "bg-[#efe2c8] text-[#6d4e16]"}`}
          >
            {t(lang, (item || "all") as MessageKey)}
          </Link>
        ))}
      </div>
      {products.length === 0 ? <p className="mt-8 text-[#5b6577]">{t(lang, "emptyCatalog")}</p> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const photo = imageUrls(product.product_images)[0]
          return (
            <Link key={product.id} href={`/market/products/${product.id}`} className="overflow-hidden rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] shadow-[0_18px_50px_rgba(14,28,51,0.08)]">
              {photo ? <img src={photo} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-[#efe2c8]" />}
              <div className="p-4">
                <div className="text-xs font-bold text-[#6d4e16]">{t(lang, product.category)}</div>
                <h2 className="mt-1 font-display text-2xl">{pickText(lang, product.title_en, product.title_zh)}</h2>
                <p className="text-sm text-[#5b6577]">{product.seller_name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <b>{money(product.price, lang)}</b>
                  <span className="text-sm text-[#5b6577]">{product.stock > 0 ? t(lang, "inStock", { n: product.stock }) : t(lang, "outOfStock")}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
