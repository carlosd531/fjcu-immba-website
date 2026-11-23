import { reviewSeller } from "@/lib/actions"
import { ApprovalQueue } from "@/components/approval-queue"
import { requireAdmin } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function SellerQueuePage() {
  await requireAdmin()
  const [lang, supabase] = await Promise.all([getLang(), createClient()])
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("requested_role", "seller")
    .eq("request_status", "pending")
    .order("created_at")
  const ids = (profiles || []).map((row) => row.id)
  const { data: notes } = ids.length
    ? await supabase.from("seller_applications").select("user_id, note").in("user_id", ids)
    : { data: [] }
  const extra = Object.fromEntries(
    (notes || []).filter((note) => note.note).map((note) => [note.user_id, note.note as string]),
  )
  return (
    <ApprovalQueue
      title={t(lang, "sellerQueue")}
      empty={t(lang, "emptyQueue")}
      rows={profiles || []}
      lang={lang}
      action={reviewSeller}
      extra={extra}
    />
  )
}
