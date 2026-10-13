const NEWS = [
  { slug: "spring-2027-apply", date: "2026-08-19", title: "Spring 2027, apply now (Sep 14 – Oct 14)", titleZh: "2027 年春季班開放申請（9/14–10/14）", tag: "Admissions", tagZh: "招生", excerpt: "This track is open to international students only. Apply online through FJCU’s international admissions system.", excerptZh: "本管道僅供國際學生申請，請至輔大國際學位生申請系統報名。", body: "Fu Jen imMBA is now accepting applications for Spring 2027. The application window is 14 September to 14 October. This English-taught track is open to international students only. Local applicants should use the Chinese admissions pathway.\n\nApply online at the FJCU International Degree Student Application System and prepare an English autobiography, study plan, English proficiency certificate (CEFR B2 preferred), two recommendation letters, and any supporting materials.", bodyZh: "輔大 imMBA 2027 年春季班開放申請，時間為 9 月 14 日至 10 月 14 日。此全英語學程僅供國際學生；本籍生請依中文招生管道辦理。\n\n請至輔大國際學位生申請系統線上報名，並準備英文自傳、讀書計畫、英語能力證明（建議 CEFR B2）、兩封推薦信及其他有助審查之資料。" },
  { slug: "career-platform", date: "2025-01-30", title: "College of Management Career Platform – Job Openings", titleZh: "管理學院職涯平台－工作職缺", tag: "Career", tagZh: "職涯", excerpt: "Explore current openings shared through the College of Management career platform.", excerptZh: "透過管理學院職涯平台查看實習與職缺。", body: "The College of Management career platform lists internships and full-time roles for students and alumni. Current students may contact the imMBA office for access guidance and advising.", bodyZh: "管理學院職涯平台提供實習與正職資訊。在學生可向 imMBA 辦公室洽詢使用方式與職涯諮詢。" },
  { slug: "how-much-is-possible", date: "2026-09-08", title: "How much is possible in two years?", titleZh: "碩士兩年，可以有多大可能？", tag: "Program", tagZh: "學程", excerpt: "A fully English-taught MBA, a 1:1 international classroom, and dual-degree pathways in two years.", excerptZh: "全英語 MBA、1:1 國際課堂，以及兩年雙聯路徑。", body: "If you are choosing a graduate program, you may be looking for more than a master’s degree. Fu Jen imMBA offers a fully English-taught environment, classmates from around the world, and the option to study abroad.\n\nJoin the 2027 admissions information session on 29 September, 12:10, LM202. Registration opens 14 September.", bodyZh: "選擇研究所時，你可能要的不只是一張碩士文憑。輔大 imMBA 提供全英語環境、來自世界各地的同學，以及出國學習的機會。\n\n歡迎參加 9 月 29 日 12:10 於 LM202 舉辦的 2027 招生說明會。報名自 9 月 14 日起。" },
  { slug: "ai-product", date: "2026-09-02", title: "90 Seconds with the Professor｜AI × Product", tag: "Courses", excerpt: "A short introduction to AI-Assisted Digital Product Development.", body: "Starting from a business idea, how can AI support digital product development? In 90 seconds, faculty introduce the thinking behind AI × Product and the skills business students can take into practice." },
  { slug: "data-analytics", date: "2026-08-26", title: "New Course Spotlight｜Data Analytics for International Business", tag: "Courses", excerpt: "Visualization, statistics, and machine learning for international business decisions.", body: "This academic year, imMBA introduces Data Analytics for International Business, covering data visualization, statistical analysis, and machine learning through real-world applications." },
  { slug: "ai-digital-product", date: "2026-08-19", title: "New Course Spotlight｜AI-Assisted Digital Product Development", tag: "Courses", excerpt: "Turn a business idea into a working digital product, even without coding experience.", body: "Students learn product design, web development, and data management while building a functional digital product—responding to how AI is changing the way ideas become solutions." },
  { slug: "summer-pause", date: "2026-08-05", title: "Summer Pause", tag: "Office", excerpt: "The imMBA office observes the university’s August recess.", body: "Every August, Fu Jen Catholic University takes a one-week summer recess. Emails received during the break are answered after the office reopens." },
  { slug: "iqs-spotlight", date: "2026-07-29", title: "Partner Spotlight | IQS School of Management", tag: "Partners", excerpt: "Barcelona-based dual-degree partner, AACSB accredited, with a tuition discount for imMBA students.", body: "IQS School of Management in Barcelona is a dual-degree partner of Fu Jen imMBA. Students may spend year two in the Master in Industrial Business Management or the Master in International Marketing in a Digital Environment." },
  { slug: "leaders-changing-world", date: "2026-07-22", title: "What kind of leaders should we cultivate?", tag: "Mission", excerpt: "Professional excellence, ethical judgment, and a commitment to the common good.", body: "AI, sustainability, geopolitics, and global industry are reshaping leadership. imMBA’s Jesuit business-school tradition asks students to pair professional skill with reflective, socially responsible practice." },
  { slug: "across-the-pacific", date: "2026-07-15", title: "Across the Pacific, one more global partner", tag: "Partners", excerpt: "Discussions with Cal Poly Pomona on a possible 1+1 dual master’s pathway.", body: "Faculty from Fu Jen’s College of Management visited California State Polytechnic University, Pomona to discuss collaboration, including a possible 1+1 dual master’s for imMBA." }
];

const FACULTY = [
  { name: "Yi-Ning Tu", role: "Associate Professor & Chair, imMBA", edu: "Ph.D. in Information Management, National Chengchi University", specs: "Data Mining, Text Mining, AI, Machine Learning, Information Retrieval", email: "082435@mail.fju.edu.tw", tel: "Ext. 3988 · LM208-2" },
  { name: "Michael T. S. Lee", role: "Chair Professor", edu: "Ph.D. in Operations Research and Industrial Engineering, University of Texas at Austin", specs: "Operations Research and Industrial Engineering", email: "036665@mail.fju.edu.tw", tel: "Ext. 2905 · SL228" },
  { name: "Yaonan Lin", role: "Professor", edu: "Ph.D. in Marketing, Golden Gate University, San Francisco", specs: "Marketing Management", email: "065999@mail.fju.edu.tw", tel: "Ext. 2735, 2021" },
  { name: "Yu-Ming Hsu", role: "Associate Professor, Director of MS Program in Technology Management", edu: "Ph.D. in International Business, National Taiwan University", specs: "Marketing, Digital Marketing, IT Marketing, Social Commerce, International Business", email: "155456@mail.fju.edu.tw", tel: "Ext. 3977 · SL225" },
  { name: "Chih-An Lin", role: "Associate Professor, Director of the Academic Exchange Center", edu: "Ph.D. in International Business, National Taiwan University", specs: "Supply Chain, Media Communication, Integrated Marketing, Brand Management", email: "144629@mail.fju.edu.tw", tel: "Ext. 2924 · SL221" },
  { name: "Kai-Ping Huang", role: "Associate Professor", edu: "Ph.D. in Business Administration, University of Technology Sydney", specs: "Business Administration", email: "129741@mail.fju.edu.tw", tel: "Ext. 2906" },
  { name: "Hsiang-Ching Tseng", role: "Associate Professor", edu: "Ph.D. in Marketing, National Chengchi University", specs: "Marketing Management", email: "142652@mail.fju.edu.tw", tel: "Ext. 2737" },
  { name: "Mei-Chun Lin", role: "Associate Professor", edu: "Ph.D. in Industrial and Information Management, National Cheng Kung University", specs: "AI in Industry, Service Marketing, Competitive Strategy, Supply Chain", email: "151308@mail.fju.edu.tw", tel: "Ext. 2968 · SL408" },
  { name: "Shu-Ling Cheng", role: "Associate Professor", edu: "Ph.D. in Business Administration, National Cheng Kung University", specs: "Strategic Management, Marketing Research, Data Analysis, International Financial Management", email: "151667@mail.fju.edu.tw", tel: "Ext. 2725 · SL211" },
  { name: "Pi-Chan Hu", role: "Associate Professor", edu: "Ph.D. in Applied Linguistics, National Chengchi University", specs: "International Business Negotiation, Translation, Interpretation, Applied Linguistics", email: "128144@mail.fju.edu.tw", tel: "Ext. 2145" },
  { name: "Tsui-Lin Chiang", role: "Assistant Professor", edu: "Ph.D. in Business Administration, Fu Jen Catholic University", specs: "Economics, Business Governance, Financial Management, Investment", email: "051266@mail.fju.edu.tw", tel: "Ext. 2852 · SL472" },
  { name: "Shu-wen Lin", role: "Assistant Professor", edu: "Ed.D., School of Education, Durham University", specs: "English for General and Specific Purposes, Global Englishes", email: "156503@mail.fju.edu.tw", tel: "Ext. 3362 · SF829" },
  { name: "Meng-Hsien Yen", role: "Assistant Professor", edu: "Ph.D. in Business Policy, National Chengchi University", specs: "General Management and Business Policy", email: "145785@mail.fju.edu.tw", tel: "Ext. 2648" },
  { name: "Hao-Hsin Hsu", role: "Assistant Professor", edu: "Ph.D. in Management Science, National Chiao Tung University", specs: "Organizational Behavior, Workplace Health Psychology, HRM", email: "144779@mail.fju.edu.tw", tel: "Ext. 2771" },
  { name: "Kai-Pin Huang", role: "Assistant Professor", edu: "Ph.D. in Industrial Engineering and Management, National Chiao Tung University", specs: "Statistical Inference, Quality Engineering, Data Mining, AI for Energy", email: "152400@mail.fju.edu.tw", tel: "Ext. 6265" },
  { name: "Lai Ferry Sugianto", role: "Assistant Professor", edu: "Ph.D. in Finance, National Chung Cheng University", specs: "Investment, Behavioral Finance, Green Finance, Climate Finance, ESG", email: "158325@mail.fju.edu.tw", tel: "Ext. 2678" },
  { name: "Tsang-Hsien Wang", role: "Assistant Professor", edu: "Ph.D. in Management, National Taiwan University of Science and Technology", specs: "Consumer Behavior, Marketing, Innovation, International Business, Brand Management", email: "167167@mail.fju.edu.tw", tel: "Ext. 3931" },
  { name: "Chia-Hua Lin", role: "Assistant Professor", edu: "Ph.D. in Psychology, National Chung Cheng University", specs: "Organizational Behavior, Industrial and Organizational Psychology", email: "167208@mail.fju.edu.tw", tel: "Ext. 2966" },
  { name: "Hui-Mei Wang", role: "Part-time Associate Professor", edu: "Ph.D. in International Business, National Taiwan University", specs: "International Business, International Marketing", email: "wanghm.tw@gmail.com", tel: "" }
];

const PHOTOS = [
  "https://www.management.fju.edu.tw/upfiles/en_/menu01779415441.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01779415376.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01779415351.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01779415325.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01779415283.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01779415236.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01495178958.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01495180378.JPG",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01495180622.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01495178992.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01495179136.jpg",
  "https://www.management.fju.edu.tw/upfiles/en_/menu01495179352.jpg"
];

const PAGES = [
  { title: "Overview and Ranking", titleZh: "特色與排名", url: "about.html", text: "AACSB accredited English-taught MBA Top 3 Taiwan international management dual degree Eduniversal" },
  { title: "Program Regulations", titleZh: "本單位規定及辦法", url: "regulations.html", text: "program meeting curriculum committee scholarship bylaw regulations" },
  { title: "Our Learning Environment", titleZh: "學習環境", url: "learning-environment.html", text: "English classroom 1:1 international students Taipei campus Jesuit business school" },
  { title: "Apply for Fu Jen imMBA", titleZh: "MBA招生資訊", url: "admissions.html", text: "Spring Fall apply documents tuition scholarship CEFR B2" },
  { title: "Scholarships", titleZh: "獎助學金資訊", url: "scholarships.html", text: "President scholarship MOE MOFA tuition reduction NT$68660 NT$40600" },
  { title: "Curriculum and Requirements", titleZh: "課程與修業規則", url: "courses.html", text: "curriculum waiver thesis prerequisites graduation credits" },
  { title: "Faculty", titleZh: "師資", url: "faculty.html", text: "professors chair Yi-Ning Tu" },
  { title: "Student Guide", titleZh: "就學指引", url: "guide.html", text: "visa housing campus calendar international students Taiwan" },
  { title: "Graduation", titleZh: "畢業資訊", url: "graduation.html", text: "thesis defense advisor requirements" },
  { title: "Dual Degree", titleZh: "雙聯學位", url: "dual-degree.html", text: "UM-Flint KEDGE IQS Michigan France Spain" },
  { title: "Exchange", titleZh: "交換學生", url: "exchange.html", text: "tuition-free exchange International Student Center" },
  { title: "Contact", titleZh: "聯絡我們", url: "contact.html", text: "imMBA office Ms Chang telephone email Xinzhuang" }
];
