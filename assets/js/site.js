function navItems() {
  return [
    {
      label: t("nav.about"),
      href: "about.html",
      children: [
        { label: t("nav.overview"), href: "about.html" },
        { label: t("nav.regulations"), href: "regulations.html" },
        { label: t("nav.learning"), href: "learning-environment.html" }
      ]
    },
    {
      label: t("nav.admissions"),
      href: "admissions.html",
      children: [
        { label: t("nav.apply"), href: "admissions.html" },
        { label: t("nav.scholarships"), href: "scholarships.html" }
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
          <p>${t("chrome.notice")}</p>
          <a class="official-link" href="${officialUrl()}" target="_blank" rel="noreferrer">${t("chrome.official")}</a>
        </div>
      </div>
      <header class="site-header">
        <div class="branding-header">
          <div class="wrap branding-inner">
            <a class="brand" href="index.html?lang=${getLang()}" aria-label="${t("chrome.brand")} ${t("chrome.brandSub")}">
              <img class="logo" src="assets/img/fujen-immba-logo-lockup.jpg" alt="">
              <span class="brand-text">
                <strong>${t("chrome.brand")}</strong>
                <em>${t("chrome.brandSub")}</em>
              </span>
            </a>
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
  document.body.insertAdjacentHTML("afterbegin", headerHTML(active));
  document.body.insertAdjacentHTML("beforeend", footerHTML());
  mountPageHero();
}

function formatDate(iso) {
  const locale = isZh() ? "zh-Hant" : "en-GB";
  return new Date(iso + "T00:00:00").toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function locNews(n) {
  if (!isZh()) return n;
  return {
    ...n,
    title: n.titleZh || n.title,
    excerpt: n.excerptZh || n.excerpt,
    body: n.bodyZh || n.body,
    tag: n.tagZh || n.tag
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

function renderNewsList(target, items, limit) {
  const list = (items || NEWS).map(locNews).slice(0, limit || 99);
  target.innerHTML = list.map((n) => `
    <a class="news-item" href="${withLang("news.html?slug=" + n.slug)}">
      <div class="date">${formatDate(n.date)}</div>
      <div>
        <strong>${n.title}</strong>
        <p class="muted" style="margin:6px 0 0">${n.excerpt}</p>
      </div>
    </a>`).join("");
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
    ...NEWS.map(locNews).filter((n) => (n.title + n.excerpt + n.body).toLowerCase().includes(q)).map((n) => ({ title: n.title, href: withLang(`news.html?slug=${n.slug}`), kind: t("search.news") })),
    ...FACULTY.filter((f) => (f.name + f.specs + f.role).toLowerCase().includes(q)).map((f) => ({ title: f.name, href: withLang("faculty.html"), kind: t("search.faculty") }))
  ];
  box.innerHTML = hits.length
    ? hits.map((h) => `<div class="news-item"><div class="date">${h.kind}</div><div><a href="${h.href}"><strong>${h.title}</strong></a></div></div>`).join("")
    : `<p class="muted">${t("search.none", { q: query })}</p>`;
}

function renderNewsDetail() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const article = locNews(NEWS.find((n) => n.slug === slug) || {});
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
  detail.innerHTML = `
    <p class="crumbs"><a href="${withLang("news.html")}">${t("nav.news")}</a> / ${article.tag}</p>
    <h1>${article.title}</h1>
    <p class="muted">${formatDate(article.date)}</p>
    ${article.body.split("\n\n").map((p) => `<p>${p}</p>`).join("")}
    <p><a class="btn btn-outline" href="${withLang("news.html")}">${t("news.back")}</a></p>`;
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

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  document.body.classList.toggle("menu-collapsed", isMenuCollapsed());
  mountChrome(page);
  applyI18n();
  bindNav();
  const newsHome = document.getElementById("home-news");
  if (newsHome) renderNewsList(newsHome, NEWS, 6);
  const newsAll = document.getElementById("all-news");
  if (newsAll) renderNewsList(newsAll, NEWS);
  if (document.getElementById("news-detail")) renderNewsDetail();
  const faculty = document.getElementById("faculty-grid");
  if (faculty) renderFaculty(faculty);
  const gallery = document.getElementById("gallery");
  if (gallery) renderGallery(gallery);
  const highlights = document.getElementById("highlights-news");
  if (highlights) renderNewsList(highlights, NEWS.filter((n) => n.tag !== "Office"));
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
});
