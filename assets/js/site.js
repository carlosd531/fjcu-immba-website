function navItems() {
  return [
    {
      label: t("nav.about"),
      href: "about.html",
      children: [
        { label: t("nav.overview"), href: "about.html" },
        ...(isZh() ? [{ label: t("nav.regulations"), href: "regulations.html" }] : []),
        { label: t("nav.learning"), href: "learning-environment.html" }
      ]
    },
    {
      label: t("nav.admissions"),
      href: "admissions.html",
      children: [
        { label: t("nav.apply"), href: "admissions.html" },
        ...(isZh() ? [{ label: t("nav.scholarships"), href: "scholarships.html" }] : [])
      ]
    },
    {
      label: t("nav.courses"),
      href: "courses.html",
      children: [
        { label: t("nav.curriculum"), href: "courses.html" }
      ]
    },
    { label: t("nav.faculty"), href: "faculty.html" },
    { label: t("nav.guide"), href: "guide.html" },
    { label: t("nav.graduation"), href: "graduation.html" },
    { label: t("nav.dual"), href: "dual-degree.html" },
    { label: t("nav.exchange"), href: "exchange.html" },
    { label: t("nav.highlights"), href: "highlights.html" },
    { label: t("nav.news"), href: "news.html" },
    { label: t("nav.gallery"), href: "gallery.html" },
    { label: t("nav.contact"), href: "contact.html" }
  ];
}

const NEWS_STORE_KEY = "immbaAdminNews";

function cloneNews(items) {
  return JSON.parse(JSON.stringify(items || []));
}

function normalizeNewsItem(n, index) {
  return {
    slug: n.slug,
    date: n.date || "",
    url: n.url || n.urlZh || "",
    order: n.order === 0 || n.order ? Number(n.order) : index + 1,
    status: n.status === "draft" ? "draft" : "published",
    top: !!n.top,
    tag: n.tag || "",
    tagZh: n.tagZh || "",
    title: n.title || "",
    titleZh: n.titleZh || "",
    body: n.body || "",
    bodyZh: n.bodyZh || "",
    images: normalizeNewsImages(n.images)
  };
}

const NEWS_IMAGE_MAX = 8;
const NEWS_IMAGE_EDGE = 1400;
const NEWS_IMAGE_QUALITY = 0.72;

function normalizeNewsImages(images) {
  if (!Array.isArray(images)) return [];
  return images.filter((img) => img && img.src).map((img, index) => ({
    id: img.id || `img-${index}`,
    src: String(img.src),
    name: img.name || "",
    alt: img.alt || img.name || ""
  }));
}

function isAllowedImageSrc(src) {
  return /^(data:image\/[a-zA-Z0-9.+-]+;base64,|https?:\/\/|assets\/)/i.test(src || "");
}

function newsGalleryHTML(images, className) {
  const list = normalizeNewsImages(images);
  if (!list.length) return "";
  return `<div class="${className}">${list.map((img) => `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || "")}">`).join("")}</div>`;
}

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
      reject(new Error("type"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, NEWS_IMAGE_EDGE / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          src: canvas.toDataURL("image/jpeg", NEWS_IMAGE_QUALITY),
          name: file.name || "",
          alt: file.name || ""
        });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function sortNews(items) {
  return cloneNews(items).sort((a, b) => {
    const orderA = Number(a.order) || 9999;
    const orderB = Number(b.order) || 9999;
    if (orderA !== orderB) return orderA - orderB;
    if (!!a.top !== !!b.top) return a.top ? -1 : 1;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
}

function getStoredNews() {
  try {
    const raw = localStorage.getItem(NEWS_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getActiveNews() {
  const raw = getStoredNews() || NEWS;
  return sortNews(raw.map((item, index) => normalizeNewsItem(item, index)));
}

function getPublishedNews() {
  return getActiveNews().filter((item) => item.status === "published");
}

function saveActiveNews(items) {
  const next = sortNews(items);
  try {
    localStorage.setItem(NEWS_STORE_KEY, JSON.stringify(next));
    return next;
  } catch {
    const error = new Error("quota");
    error.code = "quota";
    throw error;
  }
}

function restoreDefaultNews() {
  localStorage.removeItem(NEWS_STORE_KEY);
  return sortNews(NEWS);
}

function newsSlug(title, existing) {
  const base = String(title || "announcement")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "announcement";
  let slug = base;
  let n = 2;
  const used = new Set((existing || []).map((item) => item.slug));
  while (used.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

const PAGE_HEROES = {
  "about.html": { img: 0, title: "about.h1", crumbs: "about.crumbs", eyebrow: "about.eyebrow" },
  "regulations.html": { img: 2, title: "reg.h1", crumbs: "reg.crumbs", eyebrow: "nav.regulations" },
  "learning-environment.html": { img: 1, title: "learn.h1", crumbs: "learn.crumbs", eyebrow: "nav.learning" },
  "admissions.html": { img: 3, title: "adm.h1", crumbs: "adm.crumbs", eyebrow: "nav.apply" },
  "scholarships.html": { img: 4, title: "sch.h1", crumbs: "sch.crumbs", eyebrow: "nav.scholarships" },
  "courses.html": { img: 5, title: "crs.h1", crumbs: "crs.crumbs", eyebrow: "nav.curriculum" },
  "faculty.html": { img: 6, title: "fac.h1", crumbs: "fac.crumbs", eyebrow: "fac.eyebrow" },
  "guide.html": { img: 7, title: "gui.h1", crumbs: "gui.crumbs", eyebrow: "nav.guide" },
  "graduation.html": { img: 8, title: "grd.h1", crumbs: "grd.crumbs", eyebrow: "grd.eyebrow" },
  "dual-degree.html": { img: 9, title: "dua.h1", crumbs: "dua.crumbs", eyebrow: "nav.dual" },
  "exchange.html": { img: 10, title: "exc.h1", crumbs: "exc.crumbs", eyebrow: "nav.exchange" },
  "highlights.html": { img: 11, title: "hig.h1", crumbs: "hig.crumbs", eyebrow: "nav.highlights" },
  "news.html": { img: 0, title: "news.h1", crumbs: "news.crumbs", eyebrow: "news.eyebrow" },
  "admin-news.html": { img: 0, title: "admin.h1", crumbs: "admin.crumbs", eyebrow: "admin.eyebrow" },
  "gallery.html": { img: 1, title: "gal.h1", crumbs: "gal.crumbs", eyebrow: "nav.gallery" },
  "contact.html": { img: 2, title: "con.h1", crumbs: "con.crumbs", eyebrow: "con.eyebrow" },
  "resources.html": { img: 3, title: "res.h1", crumbs: "res.crumbs", eyebrow: "footer.downloads" }
};

function langHref(lang) {
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  return url.pathname.split("/").pop() + url.search + url.hash;
}

function headerHTML(active) {
  const collapsed = isMenuCollapsed();
  const items = navItems();
  return `
    <a class="skip" href="#main">${t("chrome.skip")}</a>
    <div class="site-chrome">
      <div class="notice-bar">
        <div class="wrap notice-bar-inner">
          <div class="notice-copy">
            <p>${t("chrome.notice")}</p>
            <a class="official-link" href="${officialUrl()}" target="_blank" rel="noreferrer">${t("chrome.official")}</a>
          </div>
          <div class="action-area">
            <button class="status-toggle lang-toggle" type="button" data-next-lang="${getLang() === "zh" ? "en" : "zh"}" aria-label="${t("chrome.langSwitch", { lang: getLang() === "zh" ? t("chrome.langEn") : t("chrome.langZh") })}">
              <span class="status-toggle-label">${getLang() === "zh" ? t("chrome.langEn") : t("chrome.langZh")}</span>
            </button>
            <button class="status-toggle menu-toggle" type="button" aria-expanded="${!collapsed}" aria-controls="nav" aria-label="${collapsed ? t("chrome.menuOpen") : t("chrome.menuClose")}">
              <span class="menu-toggle-icon" aria-hidden="true"></span>
              <span class="status-toggle-label menu-action">${collapsed ? t("chrome.menuOpen") : t("chrome.menuClose")}</span>
            </button>
          </div>
        </div>
      </div>
      <header class="site-header">
        <div class="branding-header">
          <div class="wrap branding-inner">
            <div class="brand">
              <a class="brand-logo" href="${withLang("admin-news.html")}" title="${t("admin.logoHint")}" aria-label="${t("admin.logoHint")}">
                <img class="logo" src="assets/img/fujen-immba-logo-lockup.jpg" alt="${t("admin.logoHint")}">
              </a>
              <a class="brand-text" href="${withLang("index.html")}">
                <strong>${t("chrome.brand")}</strong>
                <em>${t("chrome.brandSub")}</em>
              </a>
            </div>
          </div>
        </div>
        <nav class="navbar" aria-label="${t("nav.about")}">
          <div class="wrap navbar-inner">
            <div class="nav" id="nav">
              ${items.map((item) => navItemHTML(item, active)).join("")}
              <div class="nav-tools">
                <a class="btn btn-gold" href="${withLang("admissions.html")}">${t("chrome.apply")}</a>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>`;
}

function childHrefs(item) {
  return (item.children || []).map((child) => child.href);
}

function isActiveItem(item, active) {
  return item.href === active || childHrefs(item).includes(active);
}

function withLang(href) {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  const [path, hash] = href.split("#");
  const url = new URL(path, "http://local/");
  url.searchParams.set("lang", getLang());
  return url.pathname.replace(/^\//, "") + url.search + (hash ? `#${hash}` : "");
}

function navItemHTML(item, active) {
  const href = withLang(item.href);
  if (!item.children?.length) {
    return `<a href="${href}" class="${item.href === active ? "active" : ""}">${item.label}</a>`;
  }

  const open = isActiveItem(item, active);
  const items = item.children.map((child) => `
      <li>
        <a href="${withLang(child.href)}" class="${child.href === active ? "active" : ""}">${child.label}</a>
      </li>`).join("");

  return `
    <div class="nav-item has-dropdown${open ? " current" : ""}">
      <a href="${href}" class="nav-parent${open ? " active" : ""}" aria-haspopup="true" aria-expanded="false">${item.label}</a>
      <ul class="dropdown" role="menu">${items}
      </ul>
    </div>`;
}

function footerHTML() {
  return `
    <footer class="footer">
      <div class="wrap footer-grid">
        <div>
          <a class="footer-brand" href="index.html?lang=${getLang()}">
            <img src="assets/img/fujen-immba-logo-mark.jpg" alt="Fu Jen imMBA">
          </a>
          <h3>Fu Jen imMBA</h3>
          <p>${t("footer.blurb")}</p>
        </div>
        <div>
          <h3>${t("footer.visit")}</h3>
          <p>${t("footer.address")}</p>
        </div>
        <div>
          <h3>${t("footer.contact")}</h3>
          <p>${isZh() ? "張小姐" : "Ms. Chang"}<br>+886-2-2905-2750<br><a href="mailto:imMBA@mail.fju.edu.tw">imMBA@mail.fju.edu.tw</a></p>
          <p><a href="resources.html?lang=${getLang()}">${t("footer.downloads")}</a></p>
          <p><a href="admin-news.html?lang=${getLang()}">${t("admin.nav")}</a></p>
        </div>
      </div>
      <div class="wrap copy">
        © ${new Date().getFullYear()} ${t("footer.copy")}
        <a href="${officialUrl()}" target="_blank" rel="noreferrer">${t("footer.official")}</a>
        <p class="source-ref">${t("footer.source")} <a href="${officialUrl()}" target="_blank" rel="noreferrer">${t("footer.sourceLink")}</a></p>
      </div>
    </footer>`;
}

function mountPageHero() {
  const page = document.body.dataset.page;
  if (page === "admin-news.html") return;
  const spec = PAGE_HEROES[page];
  const main = document.getElementById("main");
  if (!spec || !main) return;
  main.querySelectorAll(".page-hero").forEach((el) => el.remove());
  const img = (typeof PHOTOS !== "undefined" && PHOTOS[spec.img]) || "assets/img/hero-3.jpg";
  const hero = `
    <section class="section-hero" aria-label="${t(spec.title)}">
      <img src="${img}" alt="${t(spec.title)}">
      <div class="section-hero-inner">
        <p class="crumbs">${t(spec.crumbs)}</p>
        <div class="eyebrow">${t(spec.eyebrow)}</div>
        <h1>${t(spec.title)}</h1>
      </div>
    </section>`;
  main.insertAdjacentHTML("afterbegin", hero);
}

function mountChrome(active) {
  if (!document.querySelector('link[rel="icon"]')) {
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.href = "assets/img/fujen-immba-logo-mark.jpg";
    document.head.appendChild(icon);
  }
  if (active === "admin-news.html") document.body.classList.add("is-admin");
  document.body.insertAdjacentHTML("afterbegin", headerHTML(active));
  if (active !== "admin-news.html") document.body.insertAdjacentHTML("beforeend", footerHTML());
  mountPageHero();
}

function formatDate(iso) {
  const locale = isZh() ? "zh-Hant" : "en-GB";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function locNews(n) {
  const zh = isZh();
  const hasContent = !!(n.body || n.bodyZh || (n.images && n.images.length));
  return {
    ...n,
    title: zh ? (n.titleZh || n.title) : (n.title || n.titleZh),
    body: zh ? (n.bodyZh || n.body) : (n.body || n.bodyZh),
    tag: zh ? (n.tagZh || n.tag) : (n.tag || n.tagZh),
    href: hasContent ? withLang("news.html?slug=" + n.slug) : (n.url || withLang("news.html?slug=" + n.slug)),
    external: !hasContent
  };
}

function locFaculty(f) {
  if (!isZh()) return f;
  const roles = [
    ["Associate Professor & Chair, imMBA", "副教授兼國際經營管理碩士班主任"],
    ["Associate Professor, Director of MS Program in Technology Management", "副教授兼科技管理碩士班主任"],
    ["Associate Professor, Director of the Academic Exchange Center", "副教授兼學術交流中心主任"],
    ["Part-time Associate Professor", "兼任副教授"],
    ["Chair Professor", "講座教授"],
    ["Associate Professor", "副教授"],
    ["Assistant Professor", "助理教授"],
    ["Professor", "教授"]
  ];
  let role = f.role;
  for (const [en, zh] of roles) {
    if (f.role.includes(en) || f.role === en) {
      role = zh;
      break;
    }
  }
  return { ...f, role };
}

function newsLangSwitcherHTML() {
  const lang = getLang();
  return `<div class="news-lang-switch">
    <span>${t("news.chooseLang")}</span>
    <button type="button" class="btn ${lang === "en" ? "btn-navy" : "btn-outline"}" data-set-lang="en">English</button>
    <button type="button" class="btn ${lang === "zh" ? "btn-navy" : "btn-outline"}" data-set-lang="zh">中文</button>
  </div>`;
}

function mountNewsLangSwitch(target) {
  if (!target || target.previousElementSibling?.classList.contains("news-lang-switch")) return;
  target.insertAdjacentHTML("beforebegin", newsLangSwitcherHTML());
}

function bindNewsLangSwitch() {
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.setLang));
  });
}

function renderNewsList(target, items, limit) {
  const list = (items || getPublishedNews()).map(locNews).slice(0, limit || 99);
  target.classList.remove("announce-grid");
  target.classList.add("news-list");
  mountNewsLangSwitch(target);
  target.innerHTML = list.map((n) => {
    const preview = String(n.body || "").replace(/\s+/g, " ").trim();
    const excerpt = preview.length > 160 ? `${preview.slice(0, 157)}…` : preview;
    const thumb = n.images && n.images[0]
      ? `<img class="news-thumb" src="${escapeHtml(n.images[0].src)}" alt="">`
      : "";
    return `
    <a class="news-item ${n.images && n.images.length ? "has-image" : ""} ${n.external ? "link-out" : "link-in"}" href="${n.href}" ${n.external ? 'target="_blank" rel="noreferrer"' : ""}>
      <time class="date" datetime="${n.date}">${formatDate(n.date)}</time>
      ${thumb}
      <div>
        <strong>${escapeHtml(n.title)}</strong>
        ${excerpt ? `<p class="muted news-excerpt">${escapeHtml(excerpt)}</p>` : ""}
        <span class="news-item-cta">${n.external ? t("news.viewDetails") : t("news.read")}</span>
      </div>
    </a>`;
  }).join("");
}

function renderFaculty(target) {
  target.innerHTML = FACULTY.map(locFaculty).map((f) => `
    <article class="card faculty-card">
      <small>${f.role}</small>
      <h3>${f.name}</h3>
      <p>${f.edu}</p>
      <p class="muted">${f.specs}</p>
      <p><a href="mailto:${f.email}">${f.email}</a>${f.tel ? `<br>${f.tel}` : ""}</p>
    </article>`).join("");
}

function renderGallery(target) {
  target.innerHTML = PHOTOS.map((src, i) => `<a href="${src}" target="_blank" rel="noreferrer"><img src="${src}" alt="imMBA campus and student life ${i + 1}"></a>`).join("");
}

function runSearch(query) {
  const q = query.trim().toLowerCase();
  const box = document.getElementById("search-results");
  if (!q) {
    box.innerHTML = "";
    return;
  }
  const hits = [
    ...PAGES.filter((p) => ((isZh() ? (p.titleZh || p.title) : p.title) + p.text).toLowerCase().includes(q)).map((p) => ({ title: isZh() ? (p.titleZh || p.title) : p.title, href: withLang(p.url), kind: t("search.page") })),
    ...getPublishedNews().map(locNews).filter((n) => ((n.title || "") + (n.titleZh || "") + (n.body || "") + (n.bodyZh || "")).toLowerCase().includes(q)).map((n) => ({ title: n.title, href: n.href, kind: t("search.news") })),
    ...FACULTY.filter((f) => (f.name + f.specs + f.role).toLowerCase().includes(q)).map((f) => ({ title: f.name, href: withLang("faculty.html"), kind: t("search.faculty") }))
  ];
  box.innerHTML = hits.length
    ? hits.map((h) => `<div class="news-item"><div class="date">${h.kind}</div><div><a href="${h.href}"><strong>${h.title}</strong></a></div></div>`).join("")
    : `<p class="muted">${t("search.none", { q: query })}</p>`;
}

function renderNewsDetail() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const article = locNews(getPublishedNews().find((n) => n.slug === slug) || {});
  const detail = document.getElementById("news-detail");
  const listWrap = document.getElementById("news-list-wrap");
  if (!detail) return;
  if (!slug || !article.slug) {
    detail.classList.add("hidden");
    listWrap.classList.remove("hidden");
    return;
  }
  listWrap.classList.add("hidden");
  detail.classList.remove("hidden");
  const paragraphs = (article.body || "").split("\n\n").filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  detail.innerHTML = `
    ${newsLangSwitcherHTML()}
    <p class="crumbs"><a href="${withLang("news.html")}">${t("nav.news")}</a>${article.tag ? ` / ${article.tag}` : ""}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="muted">${formatDate(article.date)}</p>
    ${newsGalleryHTML(article.images, "news-gallery")}
    ${paragraphs || (article.images && article.images.length ? "" : `<p class="muted">${t("news.noBody")}</p>`)}
    <p class="cta-row">${article.url ? `<a class="btn btn-navy" href="${escapeHtml(article.url)}" target="_blank" rel="noreferrer">${t("news.viewDetails")}</a>` : ""}
    <a class="btn btn-outline" href="${withLang("news.html")}">${t("news.back")}</a></p>
    <p class="muted source-ref">${t("home.source")}</p>`;
}

function decorateLinks() {
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || a.classList.contains("skip") || a.classList.contains("brand") || a.classList.contains("brand-logo") || a.classList.contains("brand-text") || a.classList.contains("footer-brand")) return;
    const external = /^(https?:|mailto:|tel:)/i.test(href);
    a.classList.toggle("link-out", external);
    a.classList.toggle("link-in", !external);
    if (external) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
    if (a.closest(".nav, .nav-tools, .notice-bar, .footer, .cta-row, .related-links, .source-ref, .news-lang-switch, .admin-side-nav, .admin-toolbar") || a.classList.contains("btn") || a.classList.contains("news-item") || a.querySelector(".link-hint")) return;
    if (a.querySelector("img") && [...a.childNodes].every((n) => n.nodeType !== Node.TEXT_NODE || !n.textContent.trim())) return;
    const hint = document.createElement("span");
    hint.className = `link-hint ${external ? "link-hint-out" : "link-hint-in"}`;
    hint.textContent = external ? t("link.outHint") : t("link.inHint");
    a.appendChild(hint);
  });
}

function bindNav() {
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      setMenuCollapsed(!document.body.classList.contains("menu-collapsed"));
    });
  }
  const langToggle = document.querySelector(".lang-toggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      setLang(langToggle.dataset.nextLang === "zh" ? "zh" : "en");
    });
  }

  document.querySelectorAll(".has-dropdown").forEach((item) => {
    const parent = item.querySelector(".nav-parent");
    const submenu = item.querySelector(".dropdown");
    if (!parent || !submenu) return;

    const setOpen = (open) => {
      item.classList.toggle("open", open);
      parent.setAttribute("aria-expanded", String(open));
    };

    item.addEventListener("mouseenter", () => {
      if (window.matchMedia("(min-width: 961px)").matches && !document.body.classList.contains("menu-collapsed")) setOpen(true);
    });
    item.addEventListener("mouseleave", () => {
      if (window.matchMedia("(min-width: 961px)").matches) setOpen(false);
    });
    parent.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 960px)").matches) {
        event.preventDefault();
        setOpen(!item.classList.contains("open"));
      }
    });
    parent.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
        submenu.querySelector("a")?.focus();
      }
      if (event.key === "Escape") setOpen(false);
    });
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function chunkForTranslate(text, size = 420) {
  const parts = [];
  let rest = String(text || "").trim();
  while (rest.length > size) {
    let cut = rest.lastIndexOf("\n", size);
    if (cut < 80) cut = rest.lastIndexOf(" ", size);
    if (cut < 80) cut = size;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

async function translateText(text, langpair) {
  const chunks = chunkForTranslate(text);
  if (!chunks.length) return "";
  const translated = [];
  for (const chunk of chunks) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langpair}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("translate failed");
    const data = await res.json();
    translated.push(data.responseData?.translatedText || chunk);
  }
  return translated.join("\n\n");
}

function bilingualSyncState(title, titleZh, body, bodyZh) {
  const enTitle = (title || "").trim();
  const zhTitle = (titleZh || "").trim();
  const enBody = (body || "").trim();
  const zhBody = (bodyZh || "").trim();
  const titlesOk = !!(enTitle && zhTitle);
  const bodiesOk = (!enBody && !zhBody) || !!(enBody && zhBody);
  const ok = titlesOk && bodiesOk;
  let reason = "ok";
  if (!enTitle || !zhTitle) reason = "titles";
  else if ((enBody && !zhBody) || (zhBody && !enBody)) reason = "bodies";
  return { ok, reason, titlesOk, bodiesOk };
}

function bindAdminNews() {
  const form = document.getElementById("admin-news-form");
  const table = document.querySelector("#admin-news-table tbody");
  const status = document.getElementById("admin-status");
  const formTitle = document.getElementById("admin-form-title");
  if (!form || !table) return;

  document.querySelectorAll(".admin-side-nav a[href], .admin-toolbar a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && !href.startsWith("http")) a.setAttribute("href", withLang(href));
  });

  const showStatus = (message) => {
    status.textContent = message;
    status.classList.remove("hidden");
  };

  let draftImages = [];

  const renderImageList = () => {
    const box = document.getElementById("admin-image-list");
    if (!box) return;
    box.innerHTML = draftImages.length
      ? draftImages.map((img) => `
        <figure class="admin-image-card">
          <img src="${escapeHtml(img.src)}" alt="">
          <figcaption>${escapeHtml(img.name || t("admin.imageUntitled"))}</figcaption>
          <button class="btn btn-outline" type="button" data-remove-image="${escapeHtml(img.id)}">${t("admin.imageRemove")}</button>
        </figure>`).join("")
      : `<p class="muted">${t("admin.imagesEmpty")}</p>`;
  };

  const closeForm = () => {
    form.reset();
    draftImages = [];
    renderImageList();
    const picker = document.getElementById("admin-images");
    if (picker) picker.value = "";
    const urlField = document.getElementById("admin-image-url");
    if (urlField) urlField.value = "";
    document.getElementById("admin-slug").value = "";
    form.classList.add("hidden");
    formTitle.textContent = t("admin.create");
    document.getElementById("admin-shell")?.classList.remove("is-editing");
  };

  const renderStats = (items) => {
    const published = items.filter((item) => item.status === "published").length;
    const draft = items.filter((item) => item.status === "draft").length;
    const unsynced = items.filter((item) => !bilingualSyncState(item.title, item.titleZh, item.body, item.bodyZh).ok).length;
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };
    set("admin-stat-total", items.length);
    set("admin-stat-published", published);
    set("admin-stat-draft", draft);
    set("admin-stat-sync", unsynced);
  };

  const renderTable = () => {
    const items = getActiveNews();
    renderStats(items);
    table.innerHTML = items.map((item) => {
      const sync = bilingualSyncState(item.title, item.titleZh, item.body, item.bodyZh);
      return `<tr data-slug="${escapeHtml(item.slug)}">
        <td>${escapeHtml(item.order)}</td>
        <td><span class="admin-pill admin-pill-${escapeHtml(item.status)}">${escapeHtml(t("admin." + item.status))}</span></td>
        <td>${escapeHtml(item.date || "")}${item.top ? ` <span class="tag">TOP</span>` : ""}</td>
        <td>
          ${item.images && item.images[0] ? `<img class="admin-table-thumb" src="${escapeHtml(item.images[0].src)}" alt="">` : ""}
          <strong>EN</strong> ${escapeHtml(item.title)}<br><strong>中文</strong> ${escapeHtml(item.titleZh || "—")}
          ${item.images && item.images.length ? `<br><span class="muted">${item.images.length} ${t("admin.imageCount")}</span>` : ""}
        </td>
        <td><span class="admin-pill ${sync.ok ? "admin-pill-sync" : "admin-pill-warn"}">${sync.ok ? t("admin.syncShort") : t("admin.syncNo")}</span></td>
        <td>${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${t("news.viewDetails")}</a>` : "—"}</td>
        <td class="admin-actions">
          <button class="btn btn-outline" type="button" data-edit="${escapeHtml(item.slug)}">${t("admin.update")}</button>
          <button class="btn btn-outline" type="button" data-delete="${escapeHtml(item.slug)}">${t("admin.delete")}</button>
        </td>
      </tr>`;
    }).join("");
  };

  const openForm = (item) => {
    form.classList.remove("hidden");
    document.getElementById("admin-shell")?.classList.add("is-editing");
    formTitle.textContent = item ? t("admin.update") : t("admin.create");
    document.getElementById("admin-slug").value = item?.slug || "";
    form.date.value = item?.date || "";
    form.url.value = item?.url || "";
    form.order.value = item?.order || getActiveNews().length + 1;
    form.status.value = item ? (item.status || "published") : "draft";
    form.title.value = item?.title || "";
    form.body.value = item?.body || "";
    form.titleZh.value = item?.titleZh || "";
    form.bodyZh.value = item?.bodyZh || "";
    form.top.checked = !!item?.top;
    draftImages = normalizeNewsImages(item?.images);
    renderImageList();
    ["title", "body", "titleZh", "bodyZh"].forEach((name) => {
      form[name].dataset.filledBy = item ? "user" : "";
    });
    updateAdminPreview();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const updateAdminPreview = () => {
    const dateLabel = form.date.value ? formatDate(form.date.value) : "";
    document.getElementById("preview-date-en").textContent = dateLabel;
    document.getElementById("preview-date-zh").textContent = dateLabel;
    document.getElementById("preview-title-en").textContent = form.title.value || t("admin.previewEmpty");
    document.getElementById("preview-title-zh").textContent = form.titleZh.value || t("admin.previewEmpty");
    document.getElementById("preview-body-en").textContent = form.body.value || t("admin.previewEmpty");
    document.getElementById("preview-body-zh").textContent = form.bodyZh.value || t("admin.previewEmpty");
    const previewImages = document.getElementById("preview-images");
    if (previewImages) previewImages.innerHTML = newsGalleryHTML(draftImages, "news-gallery") || `<p class="muted">${t("admin.imagesEmpty")}</p>`;
    const sync = bilingualSyncState(form.title.value, form.titleZh.value, form.body.value, form.bodyZh.value);
    const flag = document.getElementById("admin-sync");
    flag.classList.toggle("is-ok", sync.ok);
    flag.classList.toggle("is-warn", !sync.ok);
    flag.textContent = sync.ok ? t("admin.syncOk") : (sync.reason === "bodies" ? t("admin.syncBodies") : t("admin.syncTitles"));
    return sync;
  };

  const fillTranslation = async (fromName, toName, langpair, force) => {
    const source = form[fromName];
    const target = form[toName];
    const text = source.value.trim();
    if (!text) return;
    if (!force && target.value.trim() && target.dataset.filledBy === "user") return;
    target.dataset.busy = "1";
    try {
      const result = await translateText(text, langpair);
      if (result) {
        target.value = result;
        target.dataset.filledBy = "auto";
        updateAdminPreview();
      }
    } catch {
      showStatus(t("admin.translateFail"));
    } finally {
      delete target.dataset.busy;
    }
  };

  const translateTimers = {};
  const scheduleAutoTranslate = (fromName, toName, langpair) => {
    clearTimeout(translateTimers[fromName]);
    translateTimers[fromName] = setTimeout(() => fillTranslation(fromName, toName, langpair, false), 700);
  };

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (!["title", "titleZh", "body", "bodyZh", "date"].includes(field.name)) {
      updateAdminPreview();
      return;
    }
    if (["title", "titleZh", "body", "bodyZh"].includes(field.name)) {
      field.dataset.filledBy = "user";
      const pair = field.dataset.pair;
      const fromLang = field.dataset.lang;
      if (pair && fromLang) {
        const langpair = fromLang === "en" ? "en|zh-TW" : "zh-TW|en";
        scheduleAutoTranslate(field.name, pair, langpair);
      }
    }
    updateAdminPreview();
  });

  form.querySelectorAll("[data-translate-from]").forEach((btn) => {
    btn.addEventListener("click", () => {
      fillTranslation(btn.dataset.translateFrom, btn.dataset.translateTo, btn.dataset.langpair, true);
    });
  });

  document.getElementById("admin-check-sync").addEventListener("click", () => {
    const sync = updateAdminPreview();
    showStatus(sync.ok ? t("admin.syncOk") : (sync.reason === "bodies" ? t("admin.syncBodies") : t("admin.syncTitles")));
  });

  const addDraftImages = async (files) => {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    const room = NEWS_IMAGE_MAX - draftImages.length;
    if (room <= 0) {
      showStatus(t("admin.imagesMax"));
      return;
    }
    try {
      const added = [];
      for (const file of incoming.slice(0, room)) {
        added.push(await compressImageFile(file));
      }
      draftImages = draftImages.concat(added);
      renderImageList();
      updateAdminPreview();
      if (incoming.length > room) showStatus(t("admin.imagesMax"));
    } catch {
      showStatus(t("admin.imageFail"));
    }
  };

  document.getElementById("admin-images")?.addEventListener("change", (event) => {
    addDraftImages(event.target.files);
    event.target.value = "";
  });

  document.getElementById("admin-image-url-add")?.addEventListener("click", () => {
    const field = document.getElementById("admin-image-url");
    const src = (field?.value || "").trim();
    if (!src) return;
    if (!isAllowedImageSrc(src) || src.startsWith("data:")) {
      showStatus(t("admin.imageUrlFail"));
      return;
    }
    if (draftImages.length >= NEWS_IMAGE_MAX) {
      showStatus(t("admin.imagesMax"));
      return;
    }
    draftImages.push({
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      src,
      name: src.split("/").pop() || src,
      alt: ""
    });
    field.value = "";
    renderImageList();
    updateAdminPreview();
  });

  document.getElementById("admin-image-list")?.addEventListener("click", (event) => {
    const id = event.target.closest("[data-remove-image]")?.getAttribute("data-remove-image");
    if (!id) return;
    draftImages = draftImages.filter((img) => img.id !== id);
    renderImageList();
    updateAdminPreview();
  });

  document.getElementById("admin-new").addEventListener("click", () => openForm(null));
  document.getElementById("admin-cancel").addEventListener("click", closeForm);
  document.getElementById("admin-restore").addEventListener("click", () => {
    if (!confirm(t("admin.restoreConfirm"))) return;
    restoreDefaultNews();
    closeForm();
    renderTable();
    showStatus(t("admin.restored"));
  });

  table.addEventListener("click", (event) => {
    const editSlug = event.target.closest("[data-edit]")?.getAttribute("data-edit");
    const deleteSlug = event.target.closest("[data-delete]")?.getAttribute("data-delete");
    if (editSlug) {
      const item = getActiveNews().find((n) => n.slug === editSlug);
      if (item) openForm(item);
    }
    if (deleteSlug) {
      if (!confirm(t("admin.deleteConfirm"))) return;
      try {
        saveActiveNews(getActiveNews().filter((n) => n.slug !== deleteSlug));
      } catch {
        showStatus(t("admin.imageQuota"));
        return;
      }
      if (document.getElementById("admin-slug").value === deleteSlug) closeForm();
      renderTable();
      showStatus(t("admin.deleted"));
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const current = getActiveNews();
    const editing = data.slug;
    const item = {
      slug: editing || newsSlug(data.title || data.titleZh, current),
      date: data.date,
      url: (data.url || "").trim(),
      order: Number(data.order) || current.length + 1,
      status: data.status === "draft" ? "draft" : "published",
      top: form.top.checked,
      title: (data.title || "").trim(),
      titleZh: (data.titleZh || "").trim(),
      body: (data.body || "").trim(),
      bodyZh: (data.bodyZh || "").trim(),
      images: normalizeNewsImages(draftImages)
    };
    if (!item.title || !item.titleZh) {
      showStatus(t("admin.needTitles"));
      return;
    }
    const sync = bilingualSyncState(item.title, item.titleZh, item.body, item.bodyZh);
    if (item.status === "published" && !sync.ok) {
      showStatus(t("admin.publishBlocked"));
      form.status.value = "draft";
      item.status = "draft";
      updateAdminPreview();
      return;
    }
    const next = editing
      ? current.map((n) => (n.slug === editing ? { ...n, ...item } : n))
      : [item, ...current];
    try {
      saveActiveNews(next);
    } catch {
      showStatus(t("admin.imageQuota"));
      return;
    }
    closeForm();
    renderTable();
    showStatus(t("admin.synced"));
  });

  renderTable();
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  document.body.classList.toggle("menu-collapsed", isMenuCollapsed());
  mountChrome(page);
  applyI18n();
  bindNav();
  const liveNews = getPublishedNews();
  const newsHome = document.getElementById("home-news");
  if (newsHome) renderNewsList(newsHome, liveNews);
  const newsAll = document.getElementById("all-news");
  if (newsAll) renderNewsList(newsAll, liveNews);
  if (document.getElementById("news-detail")) renderNewsDetail();
  const faculty = document.getElementById("faculty-grid");
  if (faculty) renderFaculty(faculty);
  const gallery = document.getElementById("gallery");
  if (gallery) renderGallery(gallery);
  const highlights = document.getElementById("highlights-news");
  if (highlights) renderNewsList(highlights, liveNews.filter((n) => n.tag !== "Office"));
  bindNewsLangSwitch();
  if (page === "admin-news.html") bindAdminNews();
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nTopic: ${data.topic}\n\n${data.message}`);
      window.location.href = `mailto:imMBA@mail.fju.edu.tw?subject=${encodeURIComponent(data.subject || "imMBA enquiry")}&body=${body}`;
      document.getElementById("form-ok").classList.remove("hidden");
      form.reset();
    });
  }
  decorateLinks();
});
