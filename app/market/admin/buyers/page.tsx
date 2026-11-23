import { reviewBuyer } from "@/lib/actions"
import { ApprovalQueue } from "@/components/approval-queue"
import { requireAdmin } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function BuyerQueuePage() {
  await requireAdmin()
  const [lang, supabase] = await Promise.all([getLang(), createClient()])
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("requested_role", "buyer")
    .eq("request_status", "pending")
    .order("created_at")
  return (
    <ApprovalQueue
      title={t(lang, "buyerQueue")}
      empty={t(lang, "emptyQueue")}
      rows={data || []}
      lang={lang}
      action={reviewBuyer}
    />
  )
}
