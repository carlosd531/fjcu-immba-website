import { deleteUser } from "@/lib/actions"
import { when } from "@/lib/format"
import { requireAdmin } from "@/lib/guard"
import { t } from "@/lib/i18n"
import { getLang } from "@/lib/lang"
import { createClient } from "@/lib/supabase/server"
import type { MessageKey } from "@/lib/i18n"
import type { Profile } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const admin = await requireAdmin()
  const [lang, supabase, query] = await Promise.all([getLang(), createClient(), searchParams])
  const { data } = await supabase.from("profiles").select("*").order("created_at")
  const people = (data || []) as Profile[]
  return (
    <div>
      <h1 className="font-display text-5xl">{t(lang, "users")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#5b6577]">{t(lang, "deleteUserNote")}</p>
      {query.error ? <p className="mt-3 font-semibold text-[#8c3a32]">{t(lang, "errorGeneric")}</p> : null}
      <div className="mt-6 overflow-x-auto rounded-[18px] border border-[#e4e0d8] bg-[#fffcf8]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[#5b6577]">
            <tr>
              <th className="px-4 py-3">{t(lang, "name")}</th>
              <th className="px-4 py-3">{t(lang, "email")}</th>
              <th className="px-4 py-3">{t(lang, "role")}</th>
              <th className="px-4 py-3">{t(lang, "request")}</th>
              <th className="px-4 py-3">{t(lang, "joined")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-t border-[#e4e0d8]">
                <td className="px-4 py-3 font-bold">{person.full_name}</td>
                <td className="px-4 py-3">{person.email}</td>
                <td className="px-4 py-3">{t(lang, person.role === "pending" ? "waiting" : person.role)}</td>
                <td className="px-4 py-3">
                  {person.requested_role ? `${t(lang, person.requested_role)} · ${t(lang, person.request_status as MessageKey)}` : "—"}
                </td>
                <td className="px-4 py-3">{when(person.created_at, lang)}</td>
                <td className="px-4 py-3 text-right">
                  {person.role !== "admin" && person.id !== admin.id ? (
                    <form action={deleteUser}>
                      <input type="hidden" name="target" value={person.id} />
                      <button className="h-9 rounded-full border border-[#8c3a32] px-3 text-sm font-bold text-[#8c3a32]">{t(lang, "deleteUser")}</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
