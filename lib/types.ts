export type Role = "pending" | "buyer" | "seller" | "admin"
export type Lang = "en" | "zh"
export type Category = "books" | "electronics" | "home"
export type Condition = "new" | "good" | "fair"
export type OrderStatus = "placed" | "paid" | "shipped" | "completed" | "cancelled"

export type Profile = {
  id: string
  full_name: string
  email: string
  role: Role
  requested_role: "buyer" | "seller" | null
  request_status: "pending" | "approved" | "rejected"
  created_at: string
}

export type ProductImage = {
  id: string
  storage_path: string
  sort_order: number
}

export type Product = {
  id: string
  seller_id: string
  seller_name: string
  title_en: string
  title_zh: string
  description_en: string
  description_zh: string
  category: Category
  condition: Condition
  price: number
  stock: number
  hidden: boolean
  product_images: ProductImage[]
}

export type OrderItem = {
  id: string
  title_en: string
  title_zh: string
  unit_price: number
  quantity: number
  product_id: string | null
}

export type Order = {
  id: string
  buyer_id: string
  seller_id: string
  status: OrderStatus
  buyer_name: string
  fulfillment: "pickup" | "delivery"
  service_fee: number
  delivery_fee: number
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  completed_at: string | null
  order_items: OrderItem[]
}

export type Activity = {
  id: string
  type: string
  created_at: string
  actor_id: string | null
}
