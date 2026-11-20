/**
 * Onboarding tours — one per role. Pure data + storage helpers (no React).
 * Tours only read demo data to pick a page to show; they never change it.
 */
import type { AppState, Role } from "./types";
import { verifiedNeeds } from "./selectors";

type Text = { en: string; ar: string };

export interface TourStep {
  id: string;
  /** Page the step lives on (a function when it depends on demo data). */
  route: string | ((s: AppState) => string);
  /** CSS selector of the element to spotlight. Falls back to a centred card if missing. */
  target: string;
  title: Text;
  body: Text;
  /** The user may click/type inside the spotlight (only for controls that never change data). */
  interactive?: boolean;
  /** Extra tutorial-only content rendered in the tooltip. */
  extra?: "practice-contribution";
}

export interface Tour {
  role: Role;
  welcome: { title: Text; body: Text };
  steps: TourStep[];
}

const firstNeed = (s: AppState) => {
  const n = verifiedNeeds(s)[0];
  return n ? `/sponsor/marketplace/${n.id}` : "/sponsor/marketplace";
};

export const TOURS: Record<Role, Tour> = {
  student: {
    role: "student",
    welcome: {
      title: { en: "Welcome to your student dashboard", ar: "مرحبًا بك في لوحة الطالب" },
      body: {
        en: "This is where you see what an opportunity costs, what help you can get, and what is still missing. The tour takes about a minute.",
        ar: "هنا ترى تكلفة الفرصة، والمساعدة المتاحة لك، وما يزال ناقصًا. تستغرق الجولة دقيقة تقريبًا.",
      },
    },
    steps: [
      {
        id: "s-dashboard",
        route: "/student",
        target: '[data-tour="focus"]',
        title: { en: "Your money picture", ar: "صورتك المالية" },
        body: {
          en: "Meet Mariam. Her STEM competition costs AED 600 and she has AED 150. These three numbers show what's missing, what help was found, and the next deadline.",
          ar: "تعرّف إلى مريم. مسابقتها تكلّف 600 درهم ولديها 150 درهمًا. هذه الأرقام الثلاثة تُظهر ما ينقص، والمساعدة التي وُجدت، وأقرب موعد نهائي.",
        },
      },
      {
        id: "s-finder",
        route: "/student/waivers",
        target: '[data-tour="opp-filters"]',
        interactive: true,
        title: { en: "Find opportunities", ar: "اعثر على الفرص" },
        body: {
          en: "Browse real UAE competitions, internships and programmes. Try a filter — your emirate is marked. “Plan my costs” turns any of them into a budget.",
          ar: "تصفّح مسابقات وتدريبات وبرامج حقيقية في الإمارات. جرّب أحد المرشّحات — إمارتك مميّزة. زر «خطّط تكاليفي» يحوّل أيًا منها إلى ميزانية.",
        },
      },
      {
        id: "s-scanner",
        route: "/student/scanner",
        target: '[data-tour="scanner"]',
        title: { en: "Find your gap", ar: "اكتشف فجوتك" },
        body: {
          en: "List every cost — materials, transport, fees — and what you already have. BridgeFund adds it up and shows exactly what's missing.",
          ar: "اكتب كل تكلفة — المواد والمواصلات والرسوم — وما لديك بالفعل. يجمعها BridgeFund ويُظهر بدقة ما ينقصك.",
        },
      },
      {
        id: "s-engine",
        route: "/student/engine",
        target: '[data-tour="gap-meter"]',
        title: { en: "BridgeEngine cuts the cost", ar: "BridgeEngine يخفّض التكلفة" },
        body: {
          en: "It checks seven ways to save — borrowing, discounts, school support — before asking anyone for money. Mariam's AED 450 gap becomes AED 150.",
          ar: "يفحص سبع طرق للتوفير — الاستعارة والخصومات ودعم المدرسة — قبل طلب المال من أحد. فجوة مريم تصبح 150 درهمًا بدل 450.",
        },
      },
      {
        id: "s-resources",
        route: "/student/resources",
        target: '[data-tour="resource-card"], [data-tour="resources-empty"]',
        title: { en: "Borrow, don't buy", ar: "استعِر بدل الشراء" },
        body: {
          en: "Schools lend kits, laptops and calculators. Borrowing Mariam's STEM kit saves AED 200 — money nobody has to raise.",
          ar: "تُعير المدارس العُدد والحواسيب والآلات الحاسبة. استعارة عُدّة مريم توفّر 200 درهم — مال لا يحتاج أحد لجمعه.",
        },
      },
      {
        id: "s-requests",
        route: "/student/requests",
        target: '[data-tour="request-card"], [data-tour="requests-empty"]',
        title: { en: "Ask for what's left", ar: "اطلب ما تبقّى فقط" },
        body: {
          en: "Your school checks the request, then sponsors cover only the rest. Track every step here. Asking is always free, and money goes straight to the provider.",
          ar: "تتحقق مدرستك من الطلب، ثم يغطي الداعمون الباقي فقط. تابع كل خطوة هنا. الطلب مجاني دائمًا، والمال يذهب مباشرة إلى مقدّم الخدمة.",
        },
      },
    ],
  },

  institution: {
    role: "institution",
    welcome: {
      title: { en: "Welcome to your school dashboard", ar: "مرحبًا بك في لوحة المدرسة" },
      body: {
        en: "Here you check students' requests, lend equipment and approve support — so sponsors only see real, verified needs. The tour takes about a minute.",
        ar: "هنا تتحقق من طلبات الطلاب، وتُعير المعدات، وتوافق على الدعم — ليرى الداعمون احتياجات حقيقية وموثّقة فقط. تستغرق الجولة دقيقة تقريبًا.",
      },
    },
    steps: [
      {
        id: "i-dashboard",
        route: "/institution",
        target: '[data-tour="focus"]',
        title: { en: "Student needs at a glance", ar: "احتياجات الطلاب بلمحة" },
        body: {
          en: "How much students are still missing, how much help you can give, and the closest deadline. The highlighted next step is always the most urgent task.",
          ar: "كم ينقص الطلاب، وكم تستطيع أن تقدّم من مساعدة، وأقرب موعد نهائي. الخطوة التالية المميّزة هي دائمًا المهمة الأكثر إلحاحًا.",
        },
      },
      {
        id: "i-queue",
        route: "/institution/requests",
        target: '[data-tour="verify-tabs"]',
        title: { en: "Verify requests", ar: "تحقّق من الطلبات" },
        body: {
          en: "New requests wait here. Open one, check enrolment, costs and guardian consent, then approve. Checks only advise you — a person always decides.",
          ar: "تنتظر الطلبات الجديدة هنا. افتح أحدها، وتحقّق من التسجيل والتكاليف وموافقة ولي الأمر، ثم وافق. الفحوص للإرشاد فقط — القرار دائمًا لإنسان.",
        },
      },
      {
        id: "i-inventory",
        route: "/institution/resources",
        target: '[data-tour="inventory"]',
        title: { en: "Your lending shelf", ar: "رفّ الإعارة لديك" },
        body: {
          en: "Equipment students can borrow instead of buying. Keep counts up to date — every loan is a cost a family doesn't pay.",
          ar: "معدات يمكن للطلاب استعارتها بدل شرائها. حدّث الأعداد باستمرار — فكل إعارة تكلفة لا تدفعها أسرة.",
        },
      },
      {
        id: "i-assist",
        route: "/institution/matching",
        target: '[data-tour="match-card"], [data-tour="matching-empty"]',
        title: { en: "Give school support", ar: "قدّم دعم المدرسة" },
        body: {
          en: "BridgeFund matches each need to things you already have — kits, travel support, small grants. Confirm a match and the gap shrinks before sponsors step in.",
          ar: "يطابق BridgeFund كل احتياج مع ما لديك بالفعل — عُدد ودعم تنقّل ومنح صغيرة. أكّد المطابقة فتصغر الفجوة قبل تدخّل الداعمين.",
        },
      },
      {
        id: "i-pledges",
        route: "/institution/urgent",
        target: '[data-tour="pledges"]',
        title: { en: "Approve sponsor offers", ar: "وافق على عروض الداعمين" },
        body: {
          en: "When a sponsor plans a budget, their offers land here. You approve or decline each one, so money only reaches needs you've verified.",
          ar: "عندما يخطّط داعم لميزانيته تصل عروضه إلى هنا. توافق على كل عرض أو ترفضه، فلا يصل المال إلا إلى احتياجات تحقّقت منها.",
        },
      },
      {
        id: "i-analytics",
        route: "/institution/analytics",
        target: '[data-tour="analytics-stats"]',
        title: { en: "See the difference", ar: "شاهد الفرق" },
        body: {
          en: "Track how much was saved, how small sponsor requests became, and how many students took part. No individual student is ever shown.",
          ar: "تابع كم تم توفيره، وكم صغرت طلبات الداعمين، وكم طالبًا شارك. لا يظهر أي طالب بعينه أبدًا.",
        },
      },
    ],
  },

  sponsor: {
    role: "sponsor",
    welcome: {
      title: { en: "Welcome to your sponsor dashboard", ar: "مرحبًا بك في لوحة الداعم" },
      body: {
        en: "Fund students' verified needs — after costs have already been cut. The tour takes about a minute, and nothing you do in it spends money.",
        ar: "موّل احتياجات الطلاب الموثّقة — بعد أن تكون التكاليف قد خُفّضت. تستغرق الجولة دقيقة تقريبًا، ولا يُنفق فيها أي مال.",
      },
    },
    steps: [
      {
        id: "p-dashboard",
        route: "/sponsor",
        target: '[data-tour="focus"]',
        title: { en: "Your giving at a glance", ar: "عطاؤك بلمحة" },
        body: {
          en: "Your available budget, how much verified need is waiting, and the closest deadline. The next step suggests the need you could complete right now.",
          ar: "ميزانيتك المتاحة، وحجم الاحتياجات الموثّقة المنتظرة، وأقرب موعد نهائي. الخطوة التالية تقترح احتياجًا يمكنك إكماله الآن.",
        },
      },
      {
        id: "p-needs",
        route: "/sponsor/marketplace",
        target: '[data-tour="need-card"], [data-tour="needs-empty"]',
        title: { en: "Verified needs", ar: "احتياجات موثّقة" },
        body: {
          en: "Each card is checked by a school and already reduced by savings. You see an anonymous ID and emirate — never a student's name or story.",
          ar: "كل بطاقة تحقّقت منها مدرسة وخُفّضت بالتوفير مسبقًا. ترى رمزًا مجهولًا والإمارة — لا اسم الطالب ولا قصته أبدًا.",
        },
      },
      {
        id: "p-planner",
        route: "/sponsor/allocate",
        target: '[data-tour="budget"]',
        title: { en: "Plan a budget", ar: "خطّط ميزانيتك" },
        body: {
          en: "Enter an amount and compare three ways to spend it — most students, most urgent, or one subject. Schools approve the final split.",
          ar: "أدخل مبلغًا وقارن ثلاث طرق لصرفه — أكبر عدد من الطلاب، أو الأكثر إلحاحًا، أو مجال واحد. توافق المدارس على التوزيع النهائي.",
        },
      },
      {
        id: "p-contribute",
        route: firstNeed,
        target: '[data-tour="contribute"]',
        extra: "practice-contribution",
        title: { en: "How a contribution works", ar: "كيف تتم المساهمة" },
        body: {
          en: "Pick an amount below to practise. Real contributions go straight to the provider after the school approves — this practice changes nothing.",
          ar: "اختر مبلغًا أدناه للتجربة. المساهمات الحقيقية تذهب مباشرة إلى مقدّم الخدمة بعد موافقة المدرسة — هذه التجربة لا تغيّر شيئًا.",
        },
      },
      {
        id: "p-impact",
        route: "/sponsor/impact",
        target: '[data-tour="sponsor-impact"]',
        title: { en: "See your impact", ar: "شاهد أثرك" },
        body: {
          en: "The impact multiplier shows how far each dirham went: costs cut first means your money closes bigger gaps for more students.",
          ar: "مضاعِف الأثر يُظهر إلى أي مدى ذهب كل درهم: خفض التكاليف أولًا يعني أن مالك يغلق فجوات أكبر لطلاب أكثر.",
        },
      },
    ],
  },
};

export const resolveRoute = (step: TourStep, s: AppState) => (typeof step.route === "function" ? step.route(s) : step.route);

/* ---------------- persistence (separate from demo data) ---------------- */

export const TOUR_KEY = "bridgefund-tour";
export type TourStatus = "completed" | "skipped";
export interface TourStore {
  done: Partial<Record<Role, TourStatus>>;
  active?: { role: Role; step: number } | null;
}

export function readTour(): TourStore {
  try {
    const raw = localStorage.getItem(TOUR_KEY);
    const v = raw ? (JSON.parse(raw) as TourStore) : null;
    if (v && typeof v === "object" && v.done && typeof v.done === "object") return v;
  } catch {
    /* blocked or corrupted storage — treat as first visit */
  }
  return { done: {} };
}

export function writeTour(v: TourStore) {
  try {
    localStorage.setItem(TOUR_KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable — tour still works for this visit */
  }
}

/* ---------------- UI strings ---------------- */

export const TOUR_UI = {
  start: { en: "Start tutorial", ar: "ابدأ الجولة" },
  skip: { en: "Skip", ar: "تخطَّ" },
  back: { en: "Back", ar: "رجوع" },
  next: { en: "Next", ar: "التالي" },
  finish: { en: "Finish", ar: "إنهاء" },
  step: { en: "Step {n} of {total}", ar: "الخطوة {n} من {total}" },
  tour: { en: "{role} tour", ar: "جولة {role}" },
  paused: { en: "Tutorial paused", ar: "الجولة متوقفة" },
  resume: { en: "Resume", ar: "استئناف" },
  close: { en: "End tutorial", ar: "إنهاء الجولة" },
  missing: { en: "This part isn't on screen right now — press Next to continue.", ar: "هذا الجزء غير ظاهر الآن — اضغط «التالي» للمتابعة." },
  keys: { en: "Use ← → to move, Esc to leave", ar: "استخدم الأسهم للتنقل وEsc للخروج" },
  restart: { en: "Restart tutorial", ar: "أعد الجولة" },
  roles: { student: { en: "Student", ar: "الطالب" }, institution: { en: "School", ar: "المدرسة" }, sponsor: { en: "Sponsor", ar: "الداعم" } },
  practiceTitle: { en: "Practice contribution", ar: "مساهمة تجريبية" },
  practiceNote: { en: "Practice only — no money moves and no data changes.", ar: "للتجربة فقط — لا ينتقل أي مال ولا تتغير أي بيانات." },
  practiceLeft: { en: "Still needed", ar: "المتبقي" },
} as const;

export const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
