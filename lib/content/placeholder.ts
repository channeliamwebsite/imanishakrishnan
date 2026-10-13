import type {
  AboutContent,
  Achievement,
  HeroContent,
  ImpactStatistic,
  Insight,
  MediaAsset,
  MediaFeature,
  PhilosophyContent,
  SiteSettings,
  SocialLink,
  TimelineEntry,
  WorkItem,
} from "@/types/content";
import { SECTION_IDS, sectionHref } from "@/lib/sections";
import { profile } from "./profile";

/**
 * Fallback content used until Firestore is connected (and if a document is missing).
 * Shapes match the Firestore documents exactly, so this file doubles as seed data.
 *
 * Source of truth for wording: the approved workbook
 * "Nisha Web Site 02 Word - Hima Content Page.xlsx". Nothing here may be invented —
 * sections without approved content (published articles, social profiles, contact
 * details) are left empty and render accordingly.
 *
 * Placeholder width/height record the aspect ratio each slot expects, so uploads
 * to Cloudinary can be cropped to match the reference layout.
 */

/** Empty url → components/ui/Image.tsx renders an editorial placeholder frame. */
const placeholder = (alt: string, width = 1200, height = 1500): MediaAsset => ({
  url: "",
  publicId: "",
  width,
  height,
  alt,
});

const item = (id: string, order: number) => ({ id, order, published: true });

/** The long-form profile page. */
export const PROFILE_PATH = "/about";
/** Detail page of a Selected Work item. */
export const workPath = (slug: string) => `/work/${slug}`;

export const siteSettings: SiteSettings = {
  siteName: "Beyond the Story",
  roles: ["FOUNDER & CEO", "JOURNALIST", "MEDIA ENTREPRENEUR"],
  navigation: [
    { label: "About", href: sectionHref(SECTION_IDS.about) },
    { label: "Leadership", href: sectionHref(SECTION_IDS.leadership) },
    { label: "Impact", href: sectionHref(SECTION_IDS.impact) },
    { label: "Media", href: sectionHref(SECTION_IDS.media) },
    // No homepage speaking section: public speaking is documented on the profile page.
    // Awards live on the profile page (the homepage awards strip was removed).
    { label: "Awards", href: `${PROFILE_PATH}#awards` },
    { label: "Insights", href: sectionHref(SECTION_IDS.insights) },
    { label: "Contact", href: sectionHref(SECTION_IDS.contact) },
  ],
  connectCta: { label: "Connect", href: sectionHref(SECTION_IDS.contact) },
  footer: {
    description:
      "Nisha Krishnan — journalist, media entrepreneur and founder of channeliam.com. Business journalism, entrepreneurship and enterprise growth.",
    quickLinksTitle: "Quick Links",
    connectTitle: "Contact",
    connectText: "Contact details for collaborations, speaking and media enquiries will be published here.",
    // Contact email, newsletter endpoint and legal pages are not yet supplied — omitted, not invented.
    copyright: "© 2026 Nisha Krishnan. All rights reserved.",
    legalLinks: [],
  },
  seo: {
    title: "Nisha Krishnan — Founder & CEO · Journalist · Media Entrepreneur",
    titleTemplate: "%s | Nisha Krishnan",
    description:
      "Nisha Krishnan is an award-winning journalist, media entrepreneur and founder of channeliam.com, championing entrepreneurship, innovation and business growth.",
    keywords: ["Nisha Krishnan", "Channeliam", "She Power", "I AM Startup Studio", "media entrepreneur", "journalist"],
    siteUrl: "https://imanishakrishnan.vercel.app",
  },
  sections: {
    work: {
      label: "Initiatives",
      heading: "Selected Work & Impact",
      detail: {
        backLabel: "Selected Work & Impact",
        highlightsLabel: "At a glance",
        workLabel: "The work",
        strengthsLabel: "Core strengths",
        milestonesLabel: "Milestones",
      },
    },
    // Publication names supplied by the client (not in the workbook) — text only, no links or logos.
    media: { label: "Featured In", heading: "In the Media", tagline: "Stories that spark conversations." },
    awards: { label: "Recognition", heading: "Awards & Honours" },
    insights: {
      label: "Thoughts & Perspectives",
      heading: "Latest Insights",
      intro: "Commentary on media, entrepreneurship, leadership and business growth.",
      emptyText: "New articles and perspectives will be published here soon.",
    },
  },
};

/** Same shape as the hero/main Firestore document. Approved facts only. */
export const hero: HeroContent = {
  eyebrow: "MEDIA | ENTREPRENEURSHIP | BUSINESS GROWTH",
  name: "I am Nisha Krishnan",
  designation: "Founder & CEO",
  roles: ["Journalist", "Media Entrepreneur"],
  description:
    "Award-winning journalist and founder of channeliam.com, a digital media platform for entrepreneurship, innovation and business growth.",
  primaryCta: { label: "EXPLORE MY JOURNEY", link: PROFILE_PATH },
  secondaryCta: { label: "WATCH VIDEO", url: "" },
  location: "INDIA / UAE",
  // Fills the right ~55% of the hero, bleeding to the viewport edge. Subject should sit right of centre.
  image: placeholder("Portrait of Nisha Krishnan", 1600, 1500),
};

/** Same shape as statistics/{id} Firestore documents. Workbook section "3. Impact". */
export const statistics: ImpactStatistic[] = [
  { id: "stat-1", value: "24", title: "YEARS IN MEDIA", description: "Professional experience", order: 1, active: true, icon: "megaphone" },
  { id: "stat-2", value: "15,000+", title: "BUSINESS STORIES", description: "Content impact", order: 2, active: true, icon: "video" },
  { id: "stat-3", value: "10", title: "YEARS OF CHANNELIAM", description: "Entrepreneurial journey since 2016", order: 3, active: true, icon: "message" },
  // The workbook's "Professional Achievements & Global Recognition" lists exactly 12 items
  // (8 journalism awards + 4 international recognitions). "10+" is not stated anywhere.
  { id: "stat-4", value: "12", title: "AWARDS & HONOURS", description: "Journalism awards and international recognition", order: 4, active: true, icon: "trophy" },
];

/** Homepage About: the workbook's medium bio (150–200 words); the detailed profile lives on /about. */
export const about: AboutContent = {
  label: "About Nisha",
  heading: "A Journey Built on Stories",
  intro: "Media Entrepreneur · Startup Ecosystem Builder · Women’s Entrepreneurship Advocate",
  paragraphs: [
    "Nisha Krishnan is a charismatic, award-winning journalist, media entrepreneur, and founder of channeliam.com, a digital media platform championing entrepreneurship, innovation, and constructive journalism. With over 23 years of media experience, she is known for her visionary leadership, unwavering dedication, strategic thinking, and results-driven execution. A dynamic team leader, she excels at transforming ambitious ideas into impactful initiatives.",
    "Since founding channeliam.com in 2016, Nisha has built multidisciplinary teams and developed platforms connecting entrepreneurs, investors, businesses, policymakers, and institutions. Her international engagements include the prestigious U.S. Department of State's International Visitor Leadership Program (IVLP) and the Thematic International Exchange Seminar (TIES), held in Kazakhstan in 2019.",
    "She also received a U.S. Department of State grant to develop solutions addressing challenges faced by women in the post-COVID period. Through initiatives including She Power and I AM Startup Studio, she continues to champion emerging entrepreneurs and innovative ideas.",
    "A UAE Golden Visa recipient, Nisha combines inspiring leadership with disciplined execution, advancing AI-powered media, strategic collaborations, and entrepreneurial growth. Her mission is to transform powerful stories into opportunities, meaningful partnerships, and lasting impact.",
  ],
  cta: { label: "Read full profile", href: PROFILE_PATH },
  images: [
    placeholder("Nisha Krishnan speaking", 1600, 1000),
    placeholder("Kochi skyline", 1400, 1500),
  ],
  keywords: ["Journalism", "Entrepreneurship", "Startups", "Women in Business", "Business Growth"],
  profile,
};

/**
 * The 12 career milestones (workbook section "2. Career Journey"), in order. Titles are the
 * workbook's headings; descriptions are its text. The final entry is styled as "vision":
 * the advisory was initiated in 2026, but its ₹500 crore-by-2030 goal is an ambition.
 */
export const timeline: TimelineEntry[] = [
  {
    ...item("t01", 1),
    year: "2002",
    title: "The Beginning of a Journalism Career",
    description:
      "Started her professional journey at the age of 21 with Jeevan TV, marking the beginning of a career spanning news presentation, reporting, editorial leadership, and television production.",
  },
  {
    ...item("t02", 2),
    year: "2008–2011",
    title: "Recognition for Excellence in Journalism",
    description:
      "Earned prestigious honours, including the Laadli Media Award for gender-sensitive reporting and the Kerala State Media Award for impactful visual journalism. Her achievements also include the Dr. B. R. Ambedkar Award and P. C. Sukumaran Nair Memorial Award.",
  },
  {
    ...item("t03", 3),
    year: "2016",
    title: "Founded channeliam.com",
    description:
      "Established channeliam.com as a bootstrapped digital media startup, introducing a distinctive news culture focused on entrepreneurship, startups, business innovation, emerging technologies, and economic growth.",
  },
  {
    ...item("t04", 4),
    year: "2018",
    title: "Launched I Am An Entrepreneur",
    description:
      "Founded an entrepreneurship-focused initiative that brought together more than 300 emerging entrepreneurs, encouraging innovation, networking, and entrepreneurial development.",
  },
  {
    ...item("t05", 5),
    year: "2019",
    title: "Selected for the U.S. International Visitor Leadership Program",
    description:
      "Selected for the prestigious International Visitor Leadership Program (IVLP) of the U.S. Department of State, expanding her international exposure and professional networks.",
  },
  {
    ...item("t06", 6),
    year: "2019",
    title: "Represented India at TIES, Kazakhstan",
    description:
      "Participated in the Thematic International Exchange Seminar (TIES) in Almaty, Kazakhstan, focusing on women in media, media literacy, and combating misinformation. She was among three Indian delegates.",
  },
  {
    ...item("t07", 7),
    year: "2019",
    title: "Launched I AM Startup Studio",
    description:
      "Established an initiative connecting campus innovations with industry and entrepreneurial ecosystems. The programme engaged 45+ colleges and 3,500+ students, with a reported digital reach of 2.6 million.",
  },
  {
    ...item("t08", 8),
    year: "2020–2021",
    title: "She Power & U.S. State Department Grant",
    description:
      "Led She Power, an initiative supporting women's entrepreneurship, leadership, and digital empowerment. Received U.S. Department of State grant support for initiatives addressing challenges faced by women.",
  },
  {
    ...item("t09", 9),
    year: "2023",
    title: "International Recognition & UAE Golden Visa",
    description:
      "Received the UAE Golden Visa, reflecting her international professional standing. Her recognitions also include the 2023 Young Achievers Award from Naturals.",
  },
  {
    ...item("t10", 10),
    year: "2023–2025",
    title: "Pioneering AI-Powered Journalism",
    description:
      "Led Channeliam's adoption of AI news presenters and AI-enabled newsroom technologies, exploring new possibilities in digital journalism, multilingual content production, and media innovation.",
  },
  {
    ...item("t11", 11),
    year: "2026",
    kind: "figure",
    title: "Celebrating 10 Years of channeliam.com",
    description:
      "Completed a decade of media entrepreneurship, with Channeliam producing 15,000+ business stories documenting entrepreneurial journeys, emerging innovations, and business opportunities across India and beyond.",
  },
  {
    ...item("t12", 12),
    year: "2026",
    kind: "vision",
    title: "Launching Channeliam Strategic Business Advisory",
    description:
      "Initiated a new business acceleration venture designed to translate a decade of entrepreneurial insights into strategic growth support. The programme aims to help ambitious enterprises pursue expansion, stronger sales performance, digital transformation, enterprise valuation, and IPO readiness, with a long-term vision of enabling businesses to achieve ₹500 crore+ annual turnover by 2030.",
  },
];

/** Ventures & initiatives (workbook bios, milestones and expertise). */
export const work: WorkItem[] = [
  {
    ...item("channeliam", 1),
    icon: "newspaper",
    category: "Channeliam",
    tagline: "Since 2016",
    title: "channeliam.com",
    description:
      "A digital media platform championing entrepreneurship, innovation, and constructive journalism — 15,000+ business stories in its first decade.",
    cta: { label: "Visit Channeliam", href: "https://channeliam.com" },
    coverImage: placeholder("Channeliam", 1400, 600),
  },
  {
    ...item("she-power", 2),
    icon: "sparkles",
    category: "She Power",
    tagline: "Women's entrepreneurship",
    title: "She Power",
    description:
      "An initiative supporting women's entrepreneurship, leadership, and digital empowerment, with U.S. Department of State grant support.",
    cta: { label: "Learn More", href: workPath("she-power") },
    coverImage: placeholder("She Power", 1400, 600),
    slug: "she-power",
    detail: {
      expertiseAnchor: "womens-entrepreneurship",
      milestoneIds: ["t08"],
      // No official She Power website has been supplied — link to the full profile instead.
      cta: { label: "Read the Full Profile", href: PROFILE_PATH },
    },
  },
  {
    ...item("startup-studio", 3),
    icon: "lightbulb",
    category: "I AM Startup Studio",
    tagline: "Since 2019",
    title: "I AM Startup Studio",
    description:
      "Connecting campus innovations with industry and entrepreneurial ecosystems — 45+ colleges and 3,500+ students engaged.",
    cta: { label: "Learn More", href: workPath("i-am-startup-studio") },
    coverImage: placeholder("I AM Startup Studio", 1400, 600),
    slug: "i-am-startup-studio",
    detail: {
      expertiseAnchor: "campus-entrepreneurship",
      milestoneIds: ["t07"],
      // Figures from the approved milestone (workbook "2. Career Journey", 2019).
      highlights: [
        { value: "45+", label: "Colleges engaged" },
        { value: "3,500+", label: "Students engaged" },
        { value: "2.6M", label: "Reported digital reach" },
      ],
      // No official I AM Startup Studio website has been supplied — link to the full profile instead.
      cta: { label: "Read the Full Profile", href: PROFILE_PATH },
    },
  },
  {
    ...item("advisory", 4),
    icon: "chart",
    category: "Strategic Business Advisory",
    tagline: "Launched 2026",
    title: "Channeliam Strategic Business Advisory",
    description:
      "Execution-oriented support to help ambitious enterprises strengthen sales, expand markets, and accelerate digital transformation.",
    cta: { label: "Learn More", href: workPath("strategic-business-advisory") },
    coverImage: placeholder("Strategic Business Advisory", 1400, 600),
    slug: "strategic-business-advisory",
    detail: {
      expertiseAnchor: "business-growth",
      milestoneIds: ["t11", "t12"],
      // An initiative of Channeliam; channeliam.com is the verified official site.
      cta: { label: "Visit channeliam.com", href: "https://channeliam.com" },
    },
  },
];

/** Approved awards (workbook "Professional achievements") — no media coverage has been supplied. */
/** In the Media — publication names supplied by the client. Text only: no logos, links or headlines. */
export const mediaFeatures: MediaFeature[] = [
  "The Times of India",
  "Forbes",
  "The Hindu",
  "Business Standard",
  "YourStory",
  "CNBC",
  "Mint",
].map((publication, i) => ({ ...item(`m${i + 1}`, i + 1), publication }));

/**
 * Awards & Honours (achievements collection) — kept separate from media publications.
 * Names verified against the workbook; "IMA Award" = "Indian Medical Association (IMA) Award".
 */
export const achievements: Achievement[] = [
  "Kerala State Media Award",
  "Laadli Media Award",
  "Dr. B. R. Ambedkar Award",
  "P. C. Sukumaran Nair Memorial Award",
  "IMA Award",
].map((title, i) => ({ ...item(`a${i + 1}`, i + 1), title }));

/** Workbook "Blurb (Highlighted wordings)" and the leadership philosophy's heading line. */
export const philosophy: PhilosophyContent = {
  quote:
    "I don't believe in leadership that merely inspires ideas. I believe in leadership that empowers people, drives execution, and creates lasting impact.",
  supportingText: "Lead with Purpose. Inspire with Conviction. Deliver with Action.",
  author: "Nisha Krishnan",
  image: placeholder("Nisha Krishnan", 1100, 1000),
};

/** No published articles yet — the section shows an empty state until Firestore has some. */
export const insights: Insight[] = [];

/** No verified social profiles supplied yet. */
export const socialLinks: SocialLink[] = [];
