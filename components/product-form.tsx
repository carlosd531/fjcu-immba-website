import { deletePhoto, movePhoto, saveProduct } from "@/lib/actions"
import { imageUrls, sortedImages } from "@/lib/catalog"
import { t, type MessageKey } from "@/lib/i18n"
import type { Lang, Product } from "@/lib/types"

export function ProductForm({ lang, product, error }: { lang: Lang; product?: Product | null; error?: string }) {
  return (
    <div className="space-y-4">
      <form action={saveProduct} className="grid gap-4 rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-5">
        {product ? <input type="hidden" name="id" value={product.id} /> : null}
        {error === "photos" ? <p className="font-semibold text-[#8c3a32]">{t(lang, "errorPhotos")}</p> : null}
        {error && error !== "photos" ? <p className="font-semibold text-[#8c3a32]">{t(lang, "errorGeneric")}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            {t(lang, "titleEn")}
            <input name="title_en" required defaultValue={product?.title_en} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
          </label>
          <label className="text-sm font-bold">
            {t(lang, "titleZh")}
            <input name="title_zh" required defaultValue={product?.title_zh} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
          </label>
        </div>
        <label className="text-sm font-bold">
          {t(lang, "descEn")}
          <textarea name="description_en" defaultValue={product?.description_en} className="mt-1 min-h-24 w-full rounded-xl border border-[#e4e0d8] px-3 py-2" />
        </label>
        <label className="text-sm font-bold">
          {t(lang, "descZh")}
          <textarea name="description_zh" defaultValue={product?.description_zh} className="mt-1 min-h-24 w-full rounded-xl border border-[#e4e0d8] px-3 py-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-bold">
            {t(lang, "price")}
            <input name="price" type="number" min={0} required defaultValue={product?.price ?? 0} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
          </label>
          <label className="text-sm font-bold">
            {t(lang, "stock")}
            <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 1} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3" />
          </label>
          <label className="text-sm font-bold">
            {t(lang, "category")}
            <select name="category" defaultValue={product?.category || "books"} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3">
              {(["books", "electronics", "home"] as const).map((item) => (
                <option key={item} value={item}>{t(lang, item)}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="text-sm font-bold">
          {t(lang, "condition")}
          <select name="condition" defaultValue={product?.condition || "good"} className="mt-1 h-11 w-full rounded-xl border border-[#e4e0d8] px-3">
            {(["new", "good", "fair"] as const).map((item) => (
              <option key={item} value={item}>{t(lang, item as MessageKey)}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="hidden" value="true" defaultChecked={product?.hidden} />
          {t(lang, "hideListing")}
        </label>
        <label className="text-sm font-bold">
          {t(lang, "photos")}
          <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 block w-full text-sm" />
          <span className="mt-1 block font-normal text-[#5b6577]">{t(lang, "photosHelp")}</span>
        </label>
        <button className="h-11 w-fit rounded-full bg-[#b68a3d] px-5 font-bold text-white">{t(lang, "save")}</button>
      </form>
      {product ? <PhotoList lang={lang} product={product} /> : null}
    </div>
  )
}

function PhotoList({ lang, product }: { lang: Lang; product: Product }) {
  const images = sortedImages(product.product_images)
  const urls = imageUrls(images)
  if (!images.length) return null
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {images.map((image, index) => (
        <li key={image.id} className="flex gap-3 rounded-2xl border border-[#e4e0d8] bg-[#fffcf8] p-2">
          <img src={urls[index]} alt="" className="h-20 w-20 rounded-xl object-cover" />
          <div className="flex flex-col gap-1 text-sm">
            <form action={movePhoto}>
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="image_id" value={image.id} />
              <input type="hidden" name="direction" value="up" />
              <button className="font-bold">{t(lang, "moveUp")}</button>
            </form>
            <form action={movePhoto}>
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="image_id" value={image.id} />
              <input type="hidden" name="direction" value="down" />
              <button className="font-bold">{t(lang, "moveDown")}</button>
            </form>
            <form action={deletePhoto}>
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="image_id" value={image.id} />
              <button className="font-bold text-[#8c3a32]">{t(lang, "deletePhoto")}</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  )
}
