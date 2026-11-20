import { productImageUrl } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"
import type { Product, ProductImage } from "@/lib/types"

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function sortedImages(images: ProductImage[] | null | undefined) {
  return [...(images || [])].sort((a, b) => a.sort_order - b.sort_order)
}

export function imageUrls(images: ProductImage[] | null | undefined) {
  return sortedImages(images).map((image) => productImageUrl(image.storage_path))
}

export async function loadProducts(query?: string, category?: string) {
  const supabase = await createClient()
  let request = supabase.from("products").select("*, product_images(id, storage_path, sort_order)").eq("hidden", false).order("created_at", { ascending: false })
  if (category && ["books", "electronics", "home"].includes(category)) request = request.eq("category", category)
  const { data } = await request
  const products = (data || []) as Product[]
  const needle = (query || "").trim().toLowerCase()
  if (!needle) return products
  return products.filter((product) =>
    [product.title_en, product.title_zh, product.seller_name, product.description_en, product.description_zh]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  )
}

export async function loadProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*, product_images(id, storage_path, sort_order)")
    .eq("id", id)
    .maybeSingle()
  return data as Product | null
}
