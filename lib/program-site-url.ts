export const programSiteUrl = ""

export function programSiteHref(lang: "en" | "zh") {
  return programPage("index.html", lang)
}

export function programPage(path: string, lang: "en" | "zh") {
  const file = path.startsWith("/") ? path : `/${path}`
  return `${file}?lang=${lang === "zh" ? "zh" : "en"}`
}

export function officialSiteHref(lang: "en" | "zh") {
  return lang === "zh"
    ? "http://www.management.fju.edu.tw/subweb/immba/"
    : "https://www.management.fju.edu.tw/esubweb/immbaengindex/"
}
