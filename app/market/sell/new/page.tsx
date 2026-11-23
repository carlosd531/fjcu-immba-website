import { ProductForm } from "@/components/product-form"
import { requireSeller } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireSeller()
  const [lang, query] = await Promise.all([getLang(), searchParams])
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-5xl">{t(lang, "newProduct")}</h1>
      <ProductForm lang={lang} error={query.error} />
    </div>
  )
}
