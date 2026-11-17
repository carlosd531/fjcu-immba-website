import { redirect } from "next/navigation"
import { OfficeShell } from "@/components/office-shell"
import { getProfile } from "@/lib/auth"
import { homeFor } from "@/lib/format"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()
  if (profile?.role !== "admin") redirect(homeFor(profile?.role))
  return <OfficeShell profile={profile}>{children}</OfficeShell>
}
