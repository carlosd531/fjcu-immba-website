// Public project URL and publishable key for imMBA Market. Safe to ship in the browser.
const hostedUrl = "https://nqpokyfvniofcjqvmzle.supabase.co"
const hostedKey = "sb_publishable_Q7Vc5ZSlbHikC835pFQ5Xg_pmz7AxFd"

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || hostedUrl
}

export function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || hostedKey
}

export function productImageUrl(path: string) {
  return `${supabaseUrl()}/storage/v1/object/public/product-images/${path}`
}
