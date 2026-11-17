import { when } from "@/lib/format"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import type { Activity } from "@/lib/types"
import type { MessageKey } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function ActivityPage() {
  const [lang, supabase] = await Promise.all([getLang(), createClient()])
  const { data } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(80)
  const events = (data || []) as Activity[]
  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "activity")}</h1>
      {events.length === 0 ? <p className="mt-6">{t(lang, "emptyActivity")}</p> : (
        <ul className="mt-6 space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] px-4 py-3">
              <p>{t(lang, event.type as MessageKey)}</p>
              <p className="text-sm text-[#5b6577]">{when(event.created_at, lang)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
