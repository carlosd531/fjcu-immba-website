const LANG_KEY = "immbaLang";
const MENU_KEY = "immbaMenuCollapsed";

const I18N = {
  en: {
    "meta.homeTitle": "Fu Jen imMBA | MBA in International Management",
    "chrome.skip": "Skip to content",
    "chrome.notice": "Course teaching demonstration site by Carlos Albanes (not the official website)",
    "chrome.official": "Official website",
    "chrome.brand": "FU JEN Catholic University",
    "chrome.brandSub": "International Management imMBA",
    "chrome.apply": "Apply Now",
    "chrome.menuOpen": "Show menu",
    "chrome.menuClose": "Hide menu",
    "chrome.lang": "Language",
    "nav.about": "About",
    "nav.overview": "Overview and Ranking",
    "nav.regulations": "Program Regulations",
    "nav.learning": "Our Learning Environment",
    "nav.admissions": "Admissions",
    "nav.apply": "Apply for Fu Jen imMBA",
    "nav.scholarships": "Scholarships",
    "nav.courses": "Courses",
    "nav.curriculum": "Curriculum and Requirements",
    "nav.faculty": "Faculty",
    "nav.guide": "Guide",
    "nav.graduation": "Graduation",
    "nav.dual": "Dual Degree",
    "nav.exchange": "Exchange",
    "nav.highlights": "Highlights",
    "nav.news": "Announcements",
    "nav.gallery": "Gallery",
    "nav.contact": "Contact",
    "footer.blurb": "An AACSB-accredited, English-taught MBA for students who want global mobility, a diverse classroom, and dual-degree options in the United States, France, and Spain.",
    "footer.visit": "Visit",
    "footer.address": "Office LM208-1<br>No. 510, Zhongzheng Rd.<br>Xinzhuang Dist., New Taipei City 24205, Taiwan",
    "footer.contact": "Contact",
    "footer.downloads": "Downloads & links",
    "footer.copy": "Teaching demonstration by Carlos Albanes. Not the official Fu Jen imMBA website.",
    "footer.official": "Visit the official website",
    "footer.source": "Source:",
    "footer.sourceLink": "Official Fu Jen imMBA website, College of Management",
    "search.page": "Page",
    "search.news": "News",
    "search.faculty": "Faculty",
    "search.none": "No matches for “{q}”.",
    "news.back": "Return to announcements",
    "home.kicker": "Fu Jen Catholic University · College of Management",
    "home.heroTitle": "An MBA built for a global career.",
    "home.heroLead": "Study in English in Taipei with classmates from more than 30 countries. AACSB accredited, with dual-master’s pathways in the United States, France, and Spain.",
    "home.explore": "Explore the program",
    "home.statAacsb": "Top 5% of business schools worldwide",
    "home.statTop3": "Taiwan, International Management (Eduniversal 2025)",
    "home.statRatio": "Local and international students in class",
    "home.statYears": "One or two master’s degrees",
    "home.statYearsValue": "2 years",
    "home.why": "Why imMBA",
    "home.whyTitle": "A focused international MBA in Taiwan.",
    "home.overviewLink": "Explore the overview",
    "home.card1Title": "English, every course",
    "home.card1": "All teaching is in English. The classroom is built for students who will work across markets, languages, and cultures.",
    "home.card2Title": "Dual degrees",
    "home.card2": "Year one at Fu Jen. Year two at UM-Flint (USA), KEDGE (France), or IQS (Spain)—two master’s degrees in two years if both requirements are met.",
    "home.card3Title": "Scholarships that matter",
    "home.card3": "International tuition is NT$123,000 per semester. President’s Scholarship of NT$40,600 or preferential fees of NT$68,660 may apply.",
    "home.admissions": "Admissions",
    "home.springTitle": "Spring 2027 is open.",
    "home.springBody": "International applicants may apply 14 September – 14 October. Fall intake typically runs from January to June; spring from mid-October to late December.",
    "home.applySystem": "Start your application",
    "home.documents": "Review required documents",
    "home.news": "Announcements",
    "home.newsTitle": "Latest from the program",
    "home.allNews": "Read announcements",
    "home.campus": "Campus life",
    "home.gallery": "Photo gallery",
    "home.viewGallery": "Browse the gallery",
    "home.source": "Source: official Fu Jen imMBA announcements, College of Management.",
    "about.crumbs": "Home / About / Overview and Ranking",
    "about.eyebrow": "Overview and Ranking",
    "about.h1": "Practical management, global mobility.",
    "about.lead": "Fu Jen MBA in International Management is AACSB accredited and designed to give students usable business knowledge from a global perspective.",
    "about.p1": "Only about 5% of business schools worldwide hold AACSB accreditation. The curriculum connects marketing, operations, finance, human resources, technology, and strategy so graduates can work in a current global economy.",
    "about.ranking": "Ranking",
    "about.rankingP": "According to Eduniversal 2025, Fu Jen imMBA ranks top 3 in Taiwan and top 20 in Far East Asia in International Management. The College of Management has also been awarded 4 Palmes of Excellence in the Eduniversal Business Schools Ranking.",
    "about.class": "International classroom",
    "about.classP": "The program recruits local and international students from more than 30 countries for exchange or degree study. In class, the ratio of local to non-local students can be 1:1—an environment built for cross-cultural work, not just international branding.",
    "about.paths": "Two degree paths",
    "about.li1": "A two-year Fu Jen imMBA.",
    "about.li2": "A dual master’s: year one at FJCU, year two at UM-Flint, KEDGE, or IQS.",
    "about.exchange": "Students who do not take a dual degree can still join Fu Jen’s tuition-free global exchange.",
    "about.partners": "Compare dual-degree partners",
    "learn.crumbs": "Home / About / Our Learning Environment",
    "learn.h1": "Study in English, with the world in the room.",
    "learn.lead": "imMBA is designed for international students who want a professional classroom, a diverse cohort, and a campus in the Taipei metropolitan area.",
    "learn.c1t": "English, every course",
    "learn.c1": "Teaching, discussion, and assessment are in English.",
    "learn.c2t": "A 1:1 international mix",
    "learn.c2": "Degree-seeking and exchange students come from more than 30 countries. Local and non-local students often sit side by side in equal numbers.",
    "learn.c3t": "Taipei, close at hand",
    "learn.c3": "The program is based at Fu Jen’s Xinzhuang campus in New Taipei City, with direct access to Taipei’s companies, culture, and transport.",
    "learn.feel": "What the classroom feels like",
    "learn.p1": "Courses connect marketing, operations, finance, people, technology, and strategy. Recent electives include AI-assisted digital product development and data analytics for international business.",
    "learn.p2": "Outside class, students use two self-directed learning weeks each semester for industry visits, projects, or professional development.",
    "learn.p3": "The College of Management is a four-Palme Eduniversal business school.",
    "learn.support": "Support for international students",
    "learn.guide": "Read the student guide",
    "learn.photos": "Browse campus photos",
    "adm.crumbs": "Home / Admissions",
    "adm.eyebrow": "International students",
    "adm.h1": "Apply to Fu Jen imMBA.",
    "adm.lead": "All courses are in English. This admissions track is for international students. Local applicants should use the Chinese admissions pathway on the official site.",
    "adm.open": "Now open",
    "adm.spring": "Spring 2027 · 14 Sep – 14 Oct",
    "adm.notice": "Apply online via the FJCU International Degree Student Application System. Keep the official brochure for complete rules.",
    "adm.apply": "Start your application",
    "adm.brochure": "Download the admission brochure",
    "adm.scholarshipsCta": "Compare scholarships",
    "adm.options": "Degree options",
    "adm.docs": "Required documents",
    "adm.tuition": "Tuition & scholarships",
    "news.crumbs": "Home / Announcements",
    "news.eyebrow": "Announcements",
    "news.h1": "Announcements",
    "news.search": "Search news and pages...",
    "fac.crumbs": "Home / Faculty",
    "fac.eyebrow": "Full-time and professional faculty",
    "fac.h1": "Teachers who work across markets and methods.",
    "fac.lead": "Search by name or specialty using the box below.",
    "fac.search": "Search faculty...",
    "gal.crumbs": "Home / Gallery",
    "gal.h1": "Life in the program.",
    "gal.note": "Images are served from the official College of Management media library.",
    "con.crumbs": "Home / Contact",
    "con.eyebrow": "Office",
    "con.h1": "Write to us. We reply as soon as we can.",
    "con.office": "imMBA office",
    "con.maps": "Open the campus map",
    "con.topic": "Topic",
    "con.select": "Please select",
    "con.opt1": "imMBA related",
    "con.opt2": "Admissions",
    "con.opt3": "Dual degree",
    "con.opt4": "Current students",
    "con.opt5": "Other",
    "con.name": "Name",
    "con.email": "Email",
    "con.subject": "Subject",
    "con.message": "Message",
    "con.submit": "Send your message",
    "con.ok": "Your mail client should open with the message ready for imMBA@mail.fju.edu.tw.",
    "crs.crumbs": "Home / Courses / Curriculum and Requirements",
    "crs.eyebrow": "Curriculum and Requirements",
    "crs.h1": "A current, English-taught curriculum.",
    "crs.files": "Download curriculum files",
    "reg.crumbs": "Home / About / Program Regulations",
    "reg.h1": "Rules that shape the program.",
    "reg.lead": "The Chinese official site publishes the program meeting bylaw, curriculum committee bylaw, and student scholarship bylaw. This page summarizes what they cover; the official files remain the authority.",
    "reg.p1t": "Program meeting bylaw",
    "reg.p1": "Sets how the imMBA program meeting is organized, who attends, and how decisions on teaching and student affairs are recorded.",
    "reg.p2t": "Curriculum committee bylaw",
    "reg.p2": "Describes how the curriculum committee reviews course structures, new electives, and requirement changes before they are published.",
    "reg.p3t": "Student scholarship bylaw",
    "reg.p3": "Explains internal awards administered by the program, including eligibility and the effect of a leave of absence.",
    "reg.cta": "Open official regulations",
    "sch.crumbs": "Home / Admissions / Scholarships",
    "sch.h1": "Scholarships that change the tuition you pay.",
    "sch.lead": "International tuition is NT$123,000 per semester. Choose either a local-rate reduction or the President’s Scholarship—not both. Confirm current rules in the admission brochure.",
    "sch.gov": "Government and FJCU new-student awards",
    "sch.govP": "Recipients of the MOE Taiwan Scholarship, MOFA Taiwan Scholarship, or the FJCU Scholarship for New International Students in Master’s Programs may pay the local-equivalent rate of NT$68,660 per semester while the award remains active.",
    "sch.pres": "President’s Scholarship",
    "sch.presP": "New international imMBA students from English-speaking countries, or with TOEFL iBT 72, IELTS 6, or TOEIC 785 (CEFR B2, within two years), receive a NT$40,600 reduction per semester for up to four consecutive semesters—NT$82,400 payable. No separate application; it appears on the tuition slip.",
    "sch.sea": "Outbound awards",
    "sch.seaP": "The Chinese official site also lists 學海飛颺 and 學海惜珠 awards for study abroad. Ask the office which cycle is open.",
    "sch.apply": "Start your application",
    "sch.ask": "Ask the office",
    "exc.oie": "Visit the international office",
    "dua.partners": "Write to the office about dual degrees",
    "grd.crumbs": "Home / Graduation",
    "grd.eyebrow": "Requirements & thesis",
    "grd.h1": "Graduate on the version of the rules that applies to you.",
    "dua.crumbs": "Home / Dual Degree",
    "dua.h1": "Two master’s degrees in two years.",
    "exc.crumbs": "Home / Exchange",
    "exc.h1": "Tuition-free exchange worldwide.",
    "gui.crumbs": "Home / Guide",
    "gui.h1": "Arriving, studying, and living in Taipei.",
    "hig.crumbs": "Home / Highlights",
    "hig.h1": "What the program is doing now.",
    "res.crumbs": "Home / Resources",
    "res.h1": "Official files and partner links."
  },
  zh: {
    "meta.homeTitle": "輔仁大學國際經營管理碩士班（imMBA）",
    "chrome.skip": "跳到主要內容",
    "chrome.notice": "本站為 Carlos Albanes 課程教學示範網站（非官方網站）",
    "chrome.official": "官方網站",
    "chrome.brand": "輔仁大學",
    "chrome.brandSub": "國際經營管理碩士班 imMBA",
    "chrome.apply": "立即申請",
    "chrome.menuOpen": "展開選單",
    "chrome.menuClose": "收合選單",
    "chrome.lang": "語言",
    "nav.about": "簡介",
    "nav.overview": "特色與排名",
    "nav.regulations": "本單位規定及辦法",
    "nav.learning": "學習環境",
    "nav.admissions": "招生資訊",
    "nav.apply": "MBA招生資訊",
    "nav.scholarships": "獎助學金資訊",
    "nav.courses": "課程資訊",
    "nav.curriculum": "課程與修業規則",
    "nav.faculty": "師資",
    "nav.guide": "就學指引",
    "nav.graduation": "畢業資訊",
    "nav.dual": "雙聯學位",
    "nav.exchange": "交換學生",
    "nav.highlights": "學程亮點",
    "nav.news": "最新公告",
    "nav.gallery": "相片集錦",
    "nav.contact": "聯絡我們",
    "footer.blurb": "AACSB 認證、全英語授課的國際經營管理碩士班，提供美國、法國、西班牙雙聯碩士路徑，以及高度國際化的課堂。",
    "footer.visit": "辦公地點",
    "footer.address": "辦公室 LM208-1<br>新北市新莊區中正路 510 號<br>臺灣 24205",
    "footer.contact": "聯絡方式",
    "footer.downloads": "下載與連結",
    "footer.copy": "Carlos Albanes 課程教學示範網站，並非輔大 imMBA 官方網站。",
    "footer.official": "前往官方網站",
    "footer.source": "資料來源：",
    "footer.sourceLink": "輔仁大學管理學院 imMBA 官方網站",
    "search.page": "頁面",
    "search.news": "公告",
    "search.faculty": "師資",
    "search.none": "找不到與「{q}」相符的內容。",
    "news.back": "返回公告列表",
    "home.kicker": "輔仁大學 · 管理學院",
    "home.heroTitle": "為全球職涯打造的 MBA。",
    "home.heroLead": "在臺北以全英語學習，與來自 30 餘國的同學共事。AACSB 認證，並可選擇美國、法國、西班牙雙聯碩士路徑。",
    "home.explore": "認識學程",
    "home.statAacsb": "全球僅約 5% 商學院獲此認證",
    "home.statTop3": "臺灣國際經營管理領域（Eduniversal 2025）",
    "home.statRatio": "課堂本籍與非本籍學生比例",
    "home.statYears": "可取得一個或兩個碩士學位",
    "home.statYearsValue": "2 年",
    "home.why": "為什麼選擇 imMBA",
    "home.whyTitle": "聚焦國際的臺灣 MBA。",
    "home.overviewLink": "瀏覽學程簡介",
    "home.card1Title": "全英語授課",
    "home.card1": "所有課程以英語進行。課堂為將在不同市場、語言與文化中工作的學生而設計。",
    "home.card2Title": "雙聯學位",
    "home.card2": "第一年在輔仁，第二年前往 UM-Flint（美國）、KEDGE（法國）或 IQS（西班牙）；若符合雙方畢業條件，兩年可取得兩個碩士學位。",
    "home.card3Title": "實質獎學金",
    "home.card3": "國際生學雜費每學期新臺幣 123,000 元。符合資格者可選擇校長獎學金每學期 40,600 元，或優待學雜費 68,660 元。",
    "home.admissions": "招生入學",
    "home.springTitle": "2027 年春季班開放申請。",
    "home.springBody": "國際生申請時間為 9 月 14 日至 10 月 14 日。秋季班約為每年 1 月至 6 月；春季班約為 10 月中至 12 月底。",
    "home.applySystem": "開始線上申請",
    "home.documents": "查看應繳文件",
    "home.news": "公告",
    "home.newsTitle": "學程近況",
    "home.allNews": "閱讀全部公告",
    "home.campus": "校園生活",
    "home.gallery": "相片集錦",
    "home.viewGallery": "瀏覽相片集錦",
    "home.source": "資料來源：輔仁大學管理學院 imMBA 官方公告。",
    "about.crumbs": "首頁 / 關於學程 / 學程簡介與排名",
    "about.eyebrow": "學程簡介與排名",
    "about.h1": "務實管理，全球移動力。",
    "about.lead": "輔仁大學國際經營管理碩士班（imMBA）通過 AACSB 認證，從全球觀點培養可即用的商管知能。",
    "about.p1": "全球僅約 5% 商學院通過 AACSB 認證。課程串連行銷、營運、財務、人資、科技與策略，協助畢業生因應當代全球經濟。",
    "about.ranking": "排名",
    "about.rankingP": "依 Eduniversal 2025，輔大 imMBA 於國際經營管理領域名列臺灣前 3、遠東地區前 20。管理學院亦獲 4 Palmes of Excellence。",
    "about.class": "國際化課堂",
    "about.classP": "學程招收來自 30 餘國的學位生與交換生。課堂本籍與非本籍比例可達 1:1，是為跨文化工作而設計的學習環境。",
    "about.paths": "兩種學位路徑",
    "about.li1": "兩年制輔大 imMBA。",
    "about.li2": "雙聯碩士：第一年在輔大，第二年前往 UM-Flint、KEDGE 或 IQS。",
    "about.exchange": "未選擇雙聯者，仍可參加輔大免學費全球交換。",
    "about.partners": "比較雙聯夥伴學校",
    "learn.crumbs": "首頁 / 關於學程 / 學習環境",
    "learn.h1": "全英語學習，世界就在課堂裡。",
    "learn.lead": "imMBA 為需要專業課堂、多元同儕，以及臺北都會校園的國際學生而設計。",
    "learn.c1t": "全英語授課",
    "learn.c1": "教學、討論與評量皆以英語進行。",
    "learn.c2t": "1:1 國際組成",
    "learn.c2": "學位生與交換生來自 30 餘國，本籍與非本籍學生經常比肩上課。",
    "learn.c3t": "鄰近臺北",
    "learn.c3": "學程位於新北市新莊輔大校園，可便捷連結臺北企業、文化與交通。",
    "learn.feel": "課堂樣貌",
    "learn.p1": "課程連結行銷、營運、財務、組織、科技與策略。近期選修包含 AI 輔助數位產品開發、國際企業資料分析。",
    "learn.p2": "課堂外，每學期有兩週自主學習週，可用於企業參訪、專題或職能發展。",
    "learn.p3": "管理學院獲 Eduniversal 4 Palmes，反映長期國際合作，而非文案口號。",
    "learn.support": "國際生支持",
    "learn.guide": "閱讀就學指引",
    "learn.photos": "瀏覽校園相片",
    "adm.crumbs": "首頁 / 招生入學",
    "adm.eyebrow": "國際學生",
    "adm.h1": "申請輔大 imMBA。",
    "adm.lead": "所有課程以英語授課。此管道僅供國際學生。本籍生請依官方中文招生資訊申請。",
    "adm.open": "開放申請中",
    "adm.spring": "2027 年春季班 · 9/14–10/14",
    "adm.notice": "請至輔大國際學位生申請系統線上報名，並以當期招生簡章為準。",
    "adm.apply": "開始線上申請",
    "adm.brochure": "下載招生簡章",
    "adm.scholarshipsCta": "比較獎助學金",
    "adm.options": "學位選項",
    "adm.docs": "應繳文件",
    "adm.tuition": "學雜費與獎學金",
    "news.crumbs": "首頁 / 最新公告",
    "news.eyebrow": "公告",
    "news.h1": "最新公告",
    "news.search": "搜尋公告與頁面…",
    "fac.crumbs": "首頁 / 師資",
    "fac.eyebrow": "專任與專業師資",
    "fac.h1": "跨市場、跨方法的教師團隊。",
    "fac.lead": "請以姓名或專長搜尋。",
    "fac.search": "搜尋師資…",
    "gal.crumbs": "首頁 / 相片集錦",
    "gal.h1": "學程生活。",
    "gal.note": "相片取自管理學院官方媒體資料庫。",
    "con.crumbs": "首頁 / 聯絡我們",
    "con.eyebrow": "辦公室",
    "con.h1": "來信詢問，我們會盡快回覆。",
    "con.office": "imMBA 辦公室",
    "con.maps": "開啟校園地圖",
    "con.topic": "主旨類別",
    "con.select": "請選擇",
    "con.opt1": "imMBA 相關",
    "con.opt2": "招生入學",
    "con.opt3": "雙聯學位",
    "con.opt4": "在學生",
    "con.opt5": "其他",
    "con.name": "姓名",
    "con.email": "電子郵件",
    "con.subject": "主旨",
    "con.message": "內容",
    "con.submit": "送出訊息",
    "con.ok": "系統將開啟郵件程式，收件者為 imMBA@mail.fju.edu.tw。",
    "crs.crumbs": "首頁 / 課程資訊 / 課程與修業規則",
    "crs.eyebrow": "課程與修業規則",
    "crs.h1": "與時俱進的全英語課程。",
    "crs.files": "下載課程檔案",
    "reg.crumbs": "首頁 / 簡介 / 本單位規定及辦法",
    "reg.h1": "學程運作所依據的規定。",
    "reg.lead": "官方中文網站公布學程會議設置辦法、課委會設置辦法與學生獎助學金辦法。本頁僅作摘要，正式內容以官方文件為準。",
    "reg.p1t": "學程會議設置辦法",
    "reg.p1": "規範 imMBA 學程會議的組成、出席與教學、學生事務決議紀錄方式。",
    "reg.p2t": "課委會設置辦法",
    "reg.p2": "說明課程委員會如何審議課程架構、新選修與修業規定變更。",
    "reg.p3t": "學生獎助學金辦法",
    "reg.p3": "說明學程內部獎助資格，以及休學對獎助的影響。",
    "reg.cta": "開啟官方規定頁面",
    "sch.crumbs": "首頁 / 招生資訊 / 獎助學金資訊",
    "sch.h1": "真正改變學費負擔的獎助。",
    "sch.lead": "國際生學雜費每學期新臺幣 123,000 元。優待學雜費與校長獎學金擇一適用，細節以當期招生簡章為準。",
    "sch.gov": "政府與輔大新生獎助",
    "sch.govP": "教育部臺灣獎學金、外交部臺灣獎學金或輔大碩士班國際新生獎學金受獎生，於獎助有效期間可適用本籍生學雜費每學期 68,660 元。",
    "sch.pres": "校長獎學金",
    "sch.presP": "新入學國際生若來自英語系國家，或 TOEFL iBT 72、IELTS 6、TOEIC 785（CEFR B2，兩年內有效），每學期減免 40,600 元、最多連續四學期，實繳 82,400 元。無需另行申請，將反映於繳費單。",
    "sch.sea": "出國獎助",
    "sch.seaP": "官方中文網站另列學海飛颺、學海惜珠等出國獎助，請向辦公室確認當期開放情形。",
    "sch.apply": "開始線上申請",
    "sch.ask": "詢問辦公室",
    "exc.oie": "前往國際教育處",
    "dua.partners": "來信詢問雙聯學位",
    "grd.crumbs": "首頁 / 畢業資訊",
    "grd.eyebrow": "規定與論文",
    "grd.h1": "請依您入學年度適用的規定辦理畢業。",
    "dua.crumbs": "首頁 / 雙聯學位",
    "dua.h1": "兩年，兩個碩士學位。",
    "exc.crumbs": "首頁 / 交換學生",
    "exc.h1": "赴全球夥伴學校免學費交換。",
    "gui.crumbs": "首頁 / 就學指引",
    "gui.h1": "抵達、就學與生活在臺北。",
    "hig.crumbs": "首頁 / 學程亮點",
    "hig.h1": "學程正在進行的事。",
    "res.crumbs": "首頁 / 下載與連結",
    "res.h1": "官方文件與夥伴連結。"
  }
};

function getLang() {
  const param = new URLSearchParams(location.search).get("lang");
  if (param === "zh" || param === "zh-Hant" || param === "zh-TW") return "zh";
  if (param === "en") return "en";
  return localStorage.getItem(LANG_KEY) === "zh" ? "zh" : "en";
}

function t(key, vars) {
  const lang = getLang();
  let value = (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      value = value.replaceAll(`{${k}}`, vars[k]);
    });
  }
  return value;
}

function isZh() {
  return getLang() === "zh";
}

function officialUrl() {
  return isZh()
    ? "http://www.management.fju.edu.tw/subweb/immba/"
    : "https://www.management.fju.edu.tw/esubweb/immbaengindex/";
}

function setLang(lang) {
  const next = lang === "zh" ? "zh" : "en";
  localStorage.setItem(LANG_KEY, next);
  const url = new URL(location.href);
  url.searchParams.set("lang", next);
  location.assign(url.toString());
}

function applyI18n() {
  const lang = getLang();
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const html = el.getAttribute("data-i18n-html") === "true";
    const value = t(el.getAttribute("data-i18n"));
    if (html) el.innerHTML = value;
    else el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
  });
  document.querySelectorAll("a[href]").forEach((a) => {
    if (a.closest(".lang-switch") || a.classList.contains("official-link")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;
    if (href.includes(".html")) a.setAttribute("href", withLang(href));
  });
  const page = document.body.dataset.page || "index.html";
  const titles = {
    "index.html": "meta.homeTitle",
    "about.html": "nav.overview",
    "regulations.html": "nav.regulations",
    "learning-environment.html": "nav.learning",
    "admissions.html": "nav.apply",
    "scholarships.html": "nav.scholarships",
    "courses.html": "nav.curriculum",
    "faculty.html": "nav.faculty",
    "guide.html": "nav.guide",
    "graduation.html": "nav.graduation",
    "dual-degree.html": "nav.dual",
    "exchange.html": "nav.exchange",
    "highlights.html": "nav.highlights",
    "news.html": "nav.news",
    "gallery.html": "nav.gallery",
    "contact.html": "nav.contact",
    "resources.html": "footer.downloads"
  };
  if (titles[page]) {
    document.title = page === "index.html" ? t(titles[page]) : `${t(titles[page])} | ${isZh() ? "輔大 imMBA" : "Fu Jen imMBA"}`;
  }
}

function isMenuCollapsed() {
  const saved = localStorage.getItem(MENU_KEY);
  if (saved === "1") return true;
  if (saved === "0") return false;
  return window.matchMedia("(max-width: 960px)").matches;
}

function setMenuCollapsed(collapsed) {
  localStorage.setItem(MENU_KEY, collapsed ? "1" : "0");
  document.body.classList.toggle("menu-collapsed", collapsed);
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("nav");
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? t("chrome.menuOpen") : t("chrome.menuClose"));
    toggle.setAttribute("title", collapsed ? t("chrome.menuOpen") : t("chrome.menuClose"));
  }
  if (nav) nav.classList.toggle("open", !collapsed);
}
