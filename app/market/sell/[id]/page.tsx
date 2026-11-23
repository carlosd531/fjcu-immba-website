import { notFound } from "next/navigation"
import { ProductForm } from "@/components/product-form"
import { requireSeller } from "@/lib/guard"
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
  const profile = await requireSeller()
  const [{ id }, query, lang] = await Promise.all([params, searchParams, getLang()])
  const product = await loadProduct(id)
  if (!product || product.seller_id !== profile?.id) notFound()
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-5xl">{t(lang, "editProduct")}</h1>
      <ProductForm lang={lang} product={product} error={query.error} />
    </div>
  )
}
