import { cookies } from "next/headers"
import type { Lang } from "./types"

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get("immba_lang")?.value
  return value === "zh" ? "zh" : "en"
}
