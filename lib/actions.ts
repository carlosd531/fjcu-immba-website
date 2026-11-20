"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getProfile } from "@/lib/auth"
import { homeFor } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"

function fail(error: { message: string } | null) {
  if (!error) return null
  const message = error.message.toLowerCase()
  if (message.includes("stock")) return "errorStock"
  if (message.includes("photo") || message.includes("too many")) return "errorPhotos"
  if (message.includes("already")) return "errorRequest"
  if (message.includes("invalid") || message.includes("email") || message.includes("password")) return "errorAuth"
  if (message.includes("buyers only") || message.includes("admins only") || message.includes("cannot") || message.includes("not your")) return "errorForbidden"
  return "errorGeneric"
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect(`/market/login?error=${error.message.toLowerCase().includes("confirm") ? "confirm" : "auth"}`)
  }
  const profile = await getProfile()
  redirect(homeFor(profile?.role))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/market")
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const kind = formData.get("kind") === "seller" ? "seller" : "buyer"
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    options: { data: { full_name: String(formData.get("name") || "") } },
  })
  if (error) {
    const message = error.message.toLowerCase()
    redirect(`/market/signup?error=${message.includes("confirm") ? "confirm" : message.includes("already") ? "errorRequest" : "auth"}`)
  }
  if (!data.session) {
    const retry = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    })
    if (retry.error || !retry.data.session) redirect("/market/signup?error=confirm")
  }
  const { error: requestError } = await supabase.rpc("file_signup_request", {
    kind,
    note: String(formData.get("note") || ""),
  })
  if (requestError) redirect(`/market/signup?error=${fail(requestError)}`)
  redirect("/market")
}

export async function addToCart(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "buyer") redirect("/market/login")
  const supabase = await createClient()
  const productId = String(formData.get("product_id"))
  const quantity = Math.max(1, Number(formData.get("quantity") || 1))
  const { data: product } = await supabase.from("products").select("stock").eq("id", productId).single()
  if (!product || product.stock < quantity) redirect(`/market/products/${productId}?error=stock`)
  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", profile.id)
    .eq("product_id", productId)
    .maybeSingle()
  const next = (existing?.quantity || 0) + quantity
  if (next > product.stock) redirect(`/market/products/${productId}?error=stock`)
  const { error } = existing
    ? await supabase.from("cart_items").update({ quantity: next }).eq("user_id", profile.id).eq("product_id", productId)
    : await supabase.from("cart_items").insert({ user_id: profile.id, product_id: productId, quantity })
  if (error) redirect(`/market/products/${productId}?error=generic`)
  redirect("/market/cart")
}

export async function updateCart(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "buyer") redirect("/market")
  const supabase = await createClient()
  const productId = String(formData.get("product_id"))
  const quantity = Number(formData.get("quantity"))
  if (quantity < 1) {
    await supabase.from("cart_items").delete().eq("user_id", profile.id).eq("product_id", productId)
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("user_id", profile.id).eq("product_id", productId)
  }
  revalidatePath("/market/cart")
}

export async function removeCart(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "buyer") redirect("/market")
  const supabase = await createClient()
  await supabase.from("cart_items").delete().eq("user_id", profile.id).eq("product_id", String(formData.get("product_id")))
  revalidatePath("/market/cart")
}

export async function placeOrder(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "buyer") redirect("/market")
  const fulfillment = formData.get("fulfillment") === "delivery" ? "delivery" : "pickup"
  const supabase = await createClient()
  const { data: items } = await supabase.from("cart_items").select("product_id, quantity").eq("user_id", profile.id)
  if (!items?.length) redirect("/market/cart")
  const { error } = await supabase.rpc("place_orders", { payload: items, fulfillment })
  if (error) redirect(`/market/checkout?error=${fail(error)}`)
  redirect("/market/orders")
}

export async function cancelOrder(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get("order_id"))
  const { error } = await supabase.rpc("cancel_order", { target: id })
  if (error) redirect(`/market/orders/${id}?error=forbidden`)
  revalidatePath("/market/orders")
  revalidatePath(`/market/orders/${id}`)
}

export async function advanceOrder(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "seller") redirect("/market")
  const supabase = await createClient()
  const id = String(formData.get("order_id"))
  const status = String(formData.get("status"))
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) redirect(`/market/sell/orders?error=forbidden`)
  revalidatePath("/market/sell/orders")
  revalidatePath("/market/sell/sales")
}

async function uploadPhotos(productId: string, sellerId: string, files: File[]) {
  const supabase = await createClient()
  const usable = files.filter((file) => file.size > 0)
  if (!usable.length) return null
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
  const existing = count || 0
  if (existing + usable.length > 6) return "errorPhotos"
  let order = existing
  for (const file of usable) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      return "errorPhotos"
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
    const path = `${sellerId}/${productId}/${crypto.randomUUID()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) return "errorPhotos"
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: path,
      sort_order: order,
    })
    if (error) return "errorPhotos"
    order += 1
  }
  return null
}

export async function saveProduct(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "seller") redirect("/market")
  const supabase = await createClient()
  const payload = {
    title_en: String(formData.get("title_en") || "").trim(),
    title_zh: String(formData.get("title_zh") || "").trim(),
    description_en: String(formData.get("description_en") || "").trim(),
    description_zh: String(formData.get("description_zh") || "").trim(),
    category: String(formData.get("category") || "books"),
    condition: String(formData.get("condition") || "good"),
    price: Math.max(0, Math.round(Number(formData.get("price") || 0))),
    stock: Math.max(0, Math.round(Number(formData.get("stock") || 0))),
  }
  if (!payload.title_en || !payload.title_zh) redirect("/market/sell/new?error=generic")
  const existingId = String(formData.get("id") || "")
  let productId = existingId
  if (existingId) {
    const { error } = await supabase.from("products").update(payload).eq("id", existingId)
    if (error) redirect(`/market/sell/${existingId}?error=forbidden`)
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, seller_id: profile.id, seller_name: profile.full_name })
      .select("id")
      .single()
    if (error || !data) redirect("/market/sell/new?error=forbidden")
    productId = data.id
  }
  const photoError = await uploadPhotos(productId, profile.id, formData.getAll("photos") as File[])
  if (photoError) redirect(`/market/sell/${productId}?error=photos`)
  revalidatePath("/market/sell")
  revalidatePath("/market")
  redirect("/market/sell")
}

export async function setStock(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "seller") redirect("/market")
  const supabase = await createClient()
  const id = String(formData.get("id"))
  const stock = Math.max(0, Math.round(Number(formData.get("stock") || 0)))
  await supabase.from("products").update({ stock }).eq("id", id)
  revalidatePath("/market/sell")
}

export async function movePhoto(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "seller") redirect("/market")
  const supabase = await createClient()
  const productId = String(formData.get("product_id"))
  const imageId = String(formData.get("image_id"))
  const direction = formData.get("direction") === "up" ? -1 : 1
  const { data: images } = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", productId)
    .order("sort_order")
  if (!images) return
  const index = images.findIndex((image) => image.id === imageId)
  const swap = index + direction
  if (index < 0 || swap < 0 || swap >= images.length) return
  const current = images[index]
  const other = images[swap]
  await supabase.from("product_images").update({ sort_order: other.sort_order }).eq("id", current.id)
  await supabase.from("product_images").update({ sort_order: current.sort_order }).eq("id", other.id)
  revalidatePath(`/market/sell/${productId}`)
  revalidatePath(`/market/products/${productId}`)
}

export async function deletePhoto(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "seller") redirect("/market")
  const supabase = await createClient()
  const productId = String(formData.get("product_id"))
  const imageId = String(formData.get("image_id"))
  const { data: image } = await supabase.from("product_images").select("storage_path").eq("id", imageId).single()
  if (image) {
    await supabase.storage.from("product-images").remove([image.storage_path])
    await supabase.from("product_images").delete().eq("id", imageId)
  }
  revalidatePath(`/market/sell/${productId}`)
}

export async function reviewBuyer(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "admin") redirect("/market")
  const supabase = await createClient()
  const { error } = await supabase.rpc("review_buyer", {
    target: String(formData.get("target")),
    approve: formData.get("approve") === "true",
  })
  if (error) redirect("/market/admin/buyers?error=generic")
  revalidatePath("/market/admin/buyers")
  revalidatePath("/market/admin/users")
  revalidatePath("/market/admin/activity")
}

export async function reviewSeller(formData: FormData) {
  const profile = await getProfile()
  if (profile?.role !== "admin") redirect("/market")
  const supabase = await createClient()
  const { error } = await supabase.rpc("review_seller", {
    target: String(formData.get("target")),
    approve: formData.get("approve") === "true",
  })
  if (error) redirect("/market/admin/sellers?error=generic")
  revalidatePath("/market/admin/sellers")
  revalidatePath("/market/admin/users")
  revalidatePath("/market/admin/activity")
}

export async function setLanguage(formData: FormData) {
  const { cookies } = await import("next/headers")
  const lang = formData.get("lang") === "zh" ? "zh" : "en"
  const store = await cookies()
  store.set("immba_lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
  const next = String(formData.get("next") || "/")
  redirect(next.startsWith("/") ? next : "/")
}
