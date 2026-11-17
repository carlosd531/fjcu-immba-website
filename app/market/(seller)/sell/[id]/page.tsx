import { notFound } from "next/navigation"
import { ProductForm } from "@/components/product-form"
import { getProfile } from "@/lib/auth"
import { loadProduct } from "@/lib/catalog"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ id }, query, lang, profile] = await Promise.all([params, searchParams, getLang(), getProfile()])
  const product = await loadProduct(id)
  if (!product || product.seller_id !== profile?.id) notFound()
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-5xl">{t(lang, "editProduct")}</h1>
      <ProductForm lang={lang} product={product} error={query.error} />
    </div>
  )
}
