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
  label: "About Nisha",
  heading: "A Journey Built on Stories",
  // Approved profile facts only.
  paragraphs: [
    "Nisha Krishnan is a journalist, media entrepreneur and the Founder & CEO of Channeliam.com. She began in broadcast journalism in 2002 and founded Channeliam in 2016, building a platform that has produced 15,000+ business stories.",
    "Across 23+ years in media, her work spans startup ecosystem development, strategic business growth, strategic positioning, digital transformation and AI-powered media — alongside initiatives such as She Power and I AM Startup Studio.",
    "Her international engagements include the U.S. Department of State's International Visitor Leadership Program (IVLP), TIES Kazakhstan and a U.S. State Department women's empowerment grant. She also holds a UAE Golden Visa.",
  ],
  cta: { label: "Read More About Nisha", href: sectionHref(SECTION_IDS.about) },
  images: [
    placeholder("Nisha Krishnan speaking", 1600, 1000),
    placeholder("Kochi skyline", 1400, 1500),
  ],
  keywords: ["Stories", "People", "Ideas", "Communities", "A Brighter Tomorrow"],
};

/** Dated facts from the approved profile only — undated work belongs in the About copy, not here. */
export const timeline: TimelineEntry[] = [
  { ...item("t1", 1), year: "2002", title: "Began broadcast journalism" },
  { ...item("t2", 2), year: "2016", title: "Founded Channeliam" },
  { ...item("t3", 3), year: "2019", title: "U.S. Department of State IVLP" },
  { ...item("t4", 4), year: "2019", title: "TIES Kazakhstan" },
  {
    ...item("t5", 5),
    year: "Today",
    title: "Media, entrepreneurship, technology, business growth and strategic collaboration",
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
  quote: "I believe storytelling is a catalyst for innovation, empowerment and change.",
  supportingText:
    "When we tell the right stories, we create possibilities — for people, for businesses and for a more inclusive world.",
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
