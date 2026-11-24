import Link from "next/link"
import { notFound } from "next/navigation"
import { Gallery } from "@/components/gallery"
import { addToCart } from "@/lib/actions"
import { getProfile } from "@/lib/auth"
import { categoryLabelKey } from "@/lib/categories"
import { imageUrls, loadProduct } from "@/lib/catalog"
import { money, pickText } from "@/lib/format"
import { STOCK_MAX } from "@/lib/limits"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

export const dynamic = "force-dynamic"

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ id }, query, lang, profile] = await Promise.all([params, searchParams, getLang(), getProfile()])
  const product = await loadProduct(id)
  if (!product || (product.hidden && product.seller_id !== profile?.id)) notFound()
  const title = pickText(lang, product.title_en, product.title_zh)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <Gallery urls={imageUrls(product.product_images)} alt={title} />
      <div>
        <p className="text-sm font-bold text-[#b68a3d]">{t(lang, categoryLabelKey(product.category))} · {t(lang, product.condition)}</p>
        <h1 className="mt-2 font-display text-5xl">{title}</h1>
        <p className="mt-3 text-[#5b6577]">{pickText(lang, product.description_en, product.description_zh)}</p>
        <p className="mt-4 text-sm">{t(lang, "sellerLabel")}: {product.seller_name}</p>
        <p className="mt-2 font-display text-4xl">{money(product.price, lang)}</p>
        <p className="text-sm text-[#5b6577]">{product.stock > 0 ? t(lang, "inStock", { n: product.stock }) : t(lang, "outOfStock")}</p>
        <div className="mt-6 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
          {query.error === "stock" ? <p className="mb-3 text-sm font-semibold text-[#8c3a32]">{t(lang, "errorStock")}</p> : null}
          {query.error === "forbidden" ? <p className="mb-3 text-sm font-semibold text-[#8c3a32]">{t(lang, "sellerCannotBuy")}</p> : null}
          {profile?.role === "buyer" && product.stock > 0 ? (
            <form action={addToCart} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="product_id" value={product.id} />
              <label className="text-sm font-bold">
                {t(lang, "quantity")}
                <input name="quantity" type="number" min={1} max={Math.min(STOCK_MAX, product.stock)} step={1} defaultValue={1} className="mt-1 block h-11 w-24 rounded-xl border border-[#e4e0d8] px-3" />
              </label>
              <button className="h-11 rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "addToCart")}</button>
            </form>
          ) : profile?.role === "pending" ? (
            <p>{profile.requested_role === "seller" ? t(lang, "pendingSeller") : profile.request_status === "rejected" ? t(lang, "rejected") : t(lang, "pendingBuyer")}</p>
          ) : profile?.role === "seller" && product.seller_id === profile.id ? (
            <p>{t(lang, "errorOwnListing")}</p>
          ) : profile?.role === "seller" ? (
            <p>{t(lang, "sellerCannotBuy")}</p>
          ) : profile?.role === "buyer" ? (
            <p>{t(lang, "outOfStock")}</p>
          ) : profile ? (
            <p>{product.stock > 0 ? t(lang, "accountCannotBuy") : t(lang, "outOfStock")}</p>
          ) : (
            <div>
              <p>{t(lang, "signInToBuy")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/market/signup?kind=buyer" className="inline-flex h-11 items-center rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "startBuying")}</Link>
                <Link href="/market/signup?kind=seller" className="inline-flex h-11 items-center rounded-full bg-[#0e1c33] px-5 font-bold text-white">{t(lang, "beSeller")}</Link>
              </div>
              <p className="mt-3 text-sm">{t(lang, "haveAccountShort")} <Link href="/market/login" className="font-bold underline">{t(lang, "signIn")}</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
