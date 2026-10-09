import type {
  AboutContent,
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

/**
 * Fallback content used until Firestore is connected (and if a document is missing).
 * Shapes match the Firestore documents exactly, so this file doubles as seed data.
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

export const siteSettings: SiteSettings = {
  siteName: "I'm Nisha Krishnan",
  roles: ["Founder & CEO", "Journalist", "Media Entrepreneur"],
  navigation: [
    { label: "About", href: sectionHref(SECTION_IDS.about) },
    { label: "Leadership", href: sectionHref(SECTION_IDS.leadership) },
    { label: "Impact", href: sectionHref(SECTION_IDS.impact) },
    { label: "Media", href: sectionHref(SECTION_IDS.media) },
    { label: "Speaking", href: sectionHref(SECTION_IDS.speaking) },
    { label: "Insights", href: sectionHref(SECTION_IDS.insights) },
    { label: "Contact", href: sectionHref(SECTION_IDS.contact) },
  ],
  connectCta: { label: "Connect", href: sectionHref(SECTION_IDS.contact) },
  footer: {
    description:
      "Building a more inclusive, innovative and entrepreneurial tomorrow through the power of storytelling.",
    quickLinksTitle: "Quick Links",
    connectTitle: "Let's Connect",
    connectText: "Join me in the journey of ideas, impact and opportunity.",
    contactEmail: "hello@nishakrishnan.com",
    newsletterPlaceholder: "Your email address",
    copyright: "© 2026 Nisha Krishnan. All rights reserved.",
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      // { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
  seo: {
    title: "Nisha Krishnan — Founder & CEO · Journalist · Media Entrepreneur",
    titleTemplate: "%s | Nisha Krishnan",
    description:
      "Nisha Krishnan is a founder, journalist and media entrepreneur building platforms, amplifying ideas and creating impact through storytelling.",
    keywords: ["Nisha Krishnan", "Channeliam", "She Power", "media entrepreneur", "journalist"],
    siteUrl: "https://nishakrishnan.com",
  },
  sections: {
    work: { label: "Initiatives", heading: "Selected Work & Impact" },
    media: {
      label: "Featured In",
      heading: "In the Media",
      tagline: "Stories that spark conversations.",
    },
    insights: {
      label: "Thoughts & Perspectives",
      heading: "Latest Insights",
      intro:
        "Ideas, experiences and perspectives on media, entrepreneurship, leadership and a more inclusive future.",
      cta: { label: "View All Articles", href: sectionHref(SECTION_IDS.insights) },
    },
  },
};

/** Same shape as the hero/main Firestore document. Approved facts only. */
export const hero: HeroContent = {
  eyebrow: "IDEAS | PEOPLE | IMPACT",
  name: "I'm Nisha Krishnan",
  designation: "Founder & CEO",
  roles: ["Journalist", "Media Entrepreneur"],
  description:
    "Building platforms, amplifying ideas and creating impact through the power of storytelling.",
  primaryCta: { label: "EXPLORE MY JOURNEY", link: sectionHref(SECTION_IDS.about) },
  secondaryCta: { label: "WATCH VIDEO", url: "" },
  location: "KOCHI / INDIA",
  // Fills the right ~55% of the hero, bleeding to the viewport edge. Subject should sit right of centre.
  image: placeholder("Portrait of Nisha Krishnan", 1600, 1500),
};

/** Same shape as statistics/{id} Firestore documents. Approved facts only. */
export const statistics: ImpactStatistic[] = [
  {
    id: "years-in-media",
    value: "23+",
    title: "YEARS IN MEDIA",
    description: "A journey of impactful storytelling",
    order: 1,
    active: true,
    icon: "mic",
  },
  {
    id: "business-stories",
    value: "15,000+",
    title: "BUSINESS STORIES",
    description: "Stories produced through Channeliam",
    order: 2,
    active: true,
    icon: "newspaper",
  },
  {
    id: "founded-channeliam",
    value: "2016",
    title: "FOUNDED CHANNELIAM",
    description: "Building a platform for entrepreneurs and businesses",
    order: 3,
    active: true,
    icon: "building",
  },
];

export const about: AboutContent = {
  label: "Behind the Journey",
  heading: "A journey built on stories.",
  intro:
    "Nisha Krishnan|Media Entrepreneur | Visionary Leader | Startup Ecosystem Builder | Women’s Empowerment Advocate",
  // Approved profile facts only.
  paragraphs: [
    "Nisha Krishnan is a charismatic, award-winning journalist, media entrepreneur, and founder of channeliam.com. With 23 years of media experience, she is a visionary, results-driven leader known for her dedication, execution excellence, and team leadership. She champions innovation, entrepreneurship, and women’s empowerment, transforming powerful ideas into meaningful impact through media and strategic collaborations."

  ],
  cta: { label: "Read More About Nisha", href: sectionHref(SECTION_IDS.about) },
  images: [
    placeholder("Nisha Krishnan speaking", 1600, 1000),
    placeholder("Kochi skyline", 1400, 1500),
  ],
  keywords: ["Stories", "People", "Ideas", "Communities", "A Brighter Tomorrow"],
};

/**
 * The About story timeline. Approved profile facts only; the final "vision" entry is a stated
 * ambition, not an achievement, and is styled as such.
 */
export const timeline: TimelineEntry[] = [
  {
    ...item("t1", 1),
    kind: "milestone",
    year: "2002",
    title: "Began career in broadcast journalism",
    description:
      "Nisha began her career in broadcast journalism — work that shaped her approach to communication, public engagement and storytelling.",
  },
  {
    ...item("t2", 2),
    kind: "milestone",
    year: "2016",
    title: "Founded Channeliam.com",
    description:
      "She founded Channeliam.com, a digital media platform dedicated to entrepreneurship, innovation and business journalism.",
  },
  {
    ...item("t3", 3),
    kind: "milestone",
    year: "2019",
    title: "U.S. State Department IVLP & TIES Kazakhstan",
    description:
      "Her international engagements include the U.S. Department of State's International Visitor Leadership Program (IVLP) and TIES Kazakhstan, and a U.S. State Department women's empowerment grant. She also holds a UAE Golden Visa.",
  },
  {
    ...item("t4", 4),
    kind: "figure",
    year: "15,000+",
    title: "Business stories produced by Channeliam",
    description:
      "Channeliam has produced more than 15,000 business stories — a growing record of entrepreneurship, innovation and enterprise.",
  },
  {
    ...item("t5", 5),
    kind: "vision",
    year: "Next",
    title: "Vision: Channeliam Strategic Business Advisory",
    description:
      "The vision for Channeliam Strategic Business Advisory: moving beyond documenting business success toward execution-oriented support for business growth.",
  },
];

export const work: WorkItem[] = [
  {
    ...item("channeliam", 1),
    icon: "newspaper",
    category: "Channeliam",
    tagline: "A Media Platform for Tomorrow",
    title: "Channeliam.com",
    description:
      "A leading digital media platform covering startups, entrepreneurship, innovation and business transformation.",
    cta: { label: "Explore", href: sectionHref(SECTION_IDS.impact) },
    coverImage: placeholder("Channeliam", 1400, 600),
  },
  {
    ...item("she-power", 2),
    icon: "sparkles",
    category: "She Power",
    tagline: "Empower · Enable · Elevate",
    title: "She Power",
    description:
      "A women empowerment initiative to create more opportunities for women to lead, innovate and make a difference.",
    cta: { label: "Learn More", href: sectionHref(SECTION_IDS.impact) },
    coverImage: placeholder("She Power", 1400, 600),
  },
  {
    ...item("entrepreneurship", 3),
    icon: "lightbulb",
    category: "Entrepreneurship",
    title: "Entrepreneurship",
    description: "Championing startup stories, founders and innovators who are shaping the future.",
    cta: { label: "Our Coverage", href: sectionHref(SECTION_IDS.impact) },
    coverImage: placeholder("Entrepreneurship", 1400, 600),
  },
  {
    ...item("speaking", 4),
    icon: "mic",
    category: "Speaking & Advocacy",
    title: "Speaking & Advocacy",
    description:
      "Sharing insights at global and national forums on media, leadership, entrepreneurship and women empowerment.",
    cta: { label: "View Events", href: sectionHref(SECTION_IDS.speaking) },
    coverImage: placeholder("Speaking & Advocacy", 1400, 600),
  },
];

export const mediaFeatures: MediaFeature[] = [
  "The Times of India",
  "Forbes",
  "The Hindu",
  "Business Standard",
  "YourStory",
  "CNBC",
  "Mint",
].map((publication, i) => ({ ...item(`m${i + 1}`, i + 1), publication }));

export const philosophy: PhilosophyContent = {
  quote: "“I don't believe in leadership that merely inspires ideas." ,
  supportingText:"I believe in leadership that empowers people, drives execution, and creates lasting impact.",
  author: "Nisha Krishnan",
  image: placeholder("Nisha Krishnan", 1100, 1000),
};

export const insights: Insight[] = [
  {
    ...item("i1", 1),
    slug: "power-of-stories-stronger-ecosystem",
    title: "The Power of Stories in Building a Stronger Ecosystem",
    excerpt: "How storytelling can fuel entrepreneurship, connect communities and create lasting impact.",
    category: "Media",
    coverImage: placeholder("Insight cover", 1300, 500),
    publishedAt: "2026-09-18T00:00:00.000Z",
    featured: true,
  },
  {
    ...item("i2", 2),
    slug: "why-womens-leadership-matters",
    title: "Why Women's Leadership Matters More Than Ever",
    excerpt: "Reflections on opportunity, equity and the transformative power of women in business.",
    category: "Leadership",
    coverImage: placeholder("Insight cover", 1300, 500),
    publishedAt: "2026-08-27T00:00:00.000Z",
    featured: true,
  },
  {
    ...item("i3", 3),
    slug: "innovation-begins-with-conversations",
    title: "Innovation Begins with Conversations",
    excerpt: "Meaningful conversations can spark ideas, solve real problems and shape a better future.",
    category: "Entrepreneurship",
    coverImage: placeholder("Insight cover", 1300, 500),
    publishedAt: "2026-08-04T00:00:00.000Z",
    featured: true,
  },
];

export const socialLinks: SocialLink[] = [
  { ...item("s1", 1), platform: "linkedin", url: "https://www.linkedin.com", label: "LinkedIn" },
  { ...item("s2", 2), platform: "instagram", url: "https://www.instagram.com", label: "Instagram" },
  { ...item("s3", 3), platform: "email", url: "mailto:hello@nishakrishnan.com", label: "Email" },
];
