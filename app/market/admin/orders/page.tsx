import { redirect } from "next/navigation"

export default function LegacyAdminOrdersPage() {
  redirect("/market/admin/transactions")
}
