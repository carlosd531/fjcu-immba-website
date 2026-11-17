import { when } from "@/lib/format"
import { t } from "@/lib/i18n"
import type { Lang } from "@/lib/types"

export function ApprovalQueue({
  title,
  empty,
  rows,
  lang,
  action,
  extra,
}: {
  title: string
  empty: string
  rows: Array<{ id: string; full_name: string; created_at: string }>
  lang: Lang
  action: (formData: FormData) => Promise<void>
  extra?: Record<string, string>
}) {
  return (
    <div>
      <h1 className="font-display text-5xl">{title}</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-[#5b6577]">{empty}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8] p-4">
              <b>{row.full_name}</b>
              {extra?.[row.id] ? <p className="mt-1 text-sm text-[#5b6577]">{extra[row.id]}</p> : null}
              <p className="text-sm text-[#5b6577]">{when(row.created_at, lang)}</p>
              <div className="mt-3 flex gap-2">
                <form action={action}>
                  <input type="hidden" name="target" value={row.id} />
                  <input type="hidden" name="approve" value="true" />
                  <button className="h-10 rounded-full bg-[#0e1c33] px-4 text-sm font-bold text-white">{t(lang, "approve")}</button>
                </form>
                <form action={action}>
                  <input type="hidden" name="target" value={row.id} />
                  <input type="hidden" name="approve" value="false" />
                  <button className="h-10 rounded-full border border-[#8c3a32] px-4 text-sm font-bold text-[#8c3a32]">{t(lang, "reject")}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
