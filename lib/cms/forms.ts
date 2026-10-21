import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary/folders";
import { ICON_NAMES } from "@/lib/content/schemas";
import type { FieldDef } from "./fields";

/**
 * Form definitions for every admin editor. These describe the inputs (labels, help, folders) —
 * the content itself always comes from Firestore or the built-in placeholder content.
 */

const str = (v: unknown) => (typeof v === "string" ? v : "");

const linkHelp = "Internal pages start with / (e.g. /about or /#media); external sites with https://.";

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export const HERO_FIELDS: FieldDef[] = [
  { kind: "text", key: "eyebrow", label: "Eyebrow", help: "Small line above the name. Separate words with | . Hidden while a Professional identity is set (it would repeat it)." },
  { kind: "text", key: "name", label: "Name heading", required: true, help: 'A leading "I am" / "I\'m" is set smaller above the name.' },
  { kind: "text", key: "designation", label: "Designation", required: true },
  { kind: "strings", key: "roles", label: "Roles", itemLabel: "Role", help: "Shown after the designation." },
  {
    kind: "text",
    key: "identity",
    label: "Professional identity",
    placeholder: "Journalist. Media Entrepreneur. Ecosystem Builder.",
    help: "Shown directly under the name. Leave empty to show the designation and roles instead.",
  },
  {
    kind: "text",
    key: "tagline",
    label: "Brand tagline",
    placeholder: "From telling stories of change to building ecosystems of growth.",
    help: "Shown under the professional identity. Leave empty to hide.",
  },
  { kind: "textarea", key: "description", label: "Introduction", required: true, rows: 3 },
  { kind: "text", key: "location", label: "Location", help: "Separate lines with / (e.g. INDIA / UAE)." },
  { kind: "link", key: "primaryCta", label: "Main button", help: linkHelp, hrefKey: "link" },
  {
    kind: "group",
    key: "secondaryCta",
    label: "Video button",
    help: "The button is shown only when a video link is set.",
    fields: [
      { kind: "text", key: "label", label: "Button text" },
      { kind: "text", key: "url", label: "Video link", placeholder: "https://…" },
    ],
  },
  { kind: "image", key: "image", label: "Portrait", folder: CLOUDINARY_FOLDERS.hero },
];

const STAT_ICONS = [
  { value: "megaphone", label: "Media (megaphone)" },
  { value: "video", label: "Business stories (video camera)" },
  { value: "message", label: "Channeliam (message)" },
  { value: "trophy", label: "Awards (trophy)" },
];

export const STATISTIC_FIELDS: FieldDef[] = [
  { kind: "text", key: "value", label: "Figure", required: true, placeholder: "24 or 15,000+" },
  { kind: "text", key: "title", label: "Title", required: true, placeholder: "YEARS IN MEDIA" },
  { kind: "text", key: "description", label: "Description" },
  { kind: "select", key: "icon", label: "Icon", options: STAT_ICONS, emptyLabel: "Automatic (by position)" },
  {
    kind: "image",
    key: "iconImage",
    label: "Custom icon",
    folder: CLOUDINARY_FOLDERS.statistics,
    help: "Optional. Replaces the icon above — use a square, transparent PNG.",
    crop: false,
  },
];

const profileItemFields = (withDetails: boolean): FieldDef[] => [
  { kind: "text", key: "title", label: "Title", required: true },
  { kind: "textarea", key: "description", label: "Description", rows: 3 },
  ...(withDetails
    ? ([
        { kind: "strings", key: "details", label: "More paragraphs", itemLabel: "Paragraph", multiline: true },
        { kind: "textarea", key: "strengths", label: "Core strengths", rows: 2 },
        { kind: "text", key: "anchor", label: "Anchor id", help: "Lets other pages link here, e.g. /about#business-growth." },
        {
          kind: "select",
          key: "icon",
          label: "Icon",
          options: ICON_NAMES.map((name) => ({ value: name, label: name })),
          emptyLabel: "None",
        },
      ] satisfies FieldDef[])
    : []),
];

export const ABOUT_FIELDS: FieldDef[] = [
  { kind: "text", key: "label", label: "Section label" },
  { kind: "text", key: "heading", label: "Heading", required: true },
  { kind: "text", key: "intro", label: "Lead line" },
  { kind: "strings", key: "paragraphs", label: "Paragraphs", itemLabel: "Paragraph", multiline: true },
  { kind: "textarea", key: "closing", label: "Closing line", rows: 2, help: "Shown after the timeline." },
  { kind: "link", key: "cta", label: "Link to full profile", help: linkHelp },
  {
    kind: "images",
    key: "images",
    label: "Images",
    folder: CLOUDINARY_FOLDERS.profile,
    help: "Image 1 is the wide primary image; image 2 the secondary image.",
  },
  { kind: "strings", key: "keywords", label: "Keywords", itemLabel: "Keyword" },
  {
    kind: "group",
    key: "profile",
    label: "Profile page (/about)",
    fields: [
      {
        kind: "group",
        key: "intro",
        label: "Introduction",
        help: "The top of /about: name, tagline and the first biography paragraph beside this portrait.",
        fields: [
          { kind: "image", key: "image", label: "Portrait", folder: CLOUDINARY_FOLDERS.profile },
          { kind: "textarea", key: "quote", label: "Quotation (optional)", rows: 2, help: "Only an approved quotation. Leave empty to hide the panel." },
        ],
      },
      { kind: "textarea", key: "tagline", label: "Tagline", rows: 2, help: "Also shown as the role highlights beside My Story (separate with ·)." },
      { kind: "strings", key: "detailedBio", label: "Biography (My Story)", itemLabel: "Paragraph", multiline: true },
      { kind: "image", key: "storyImage", label: "My Story photograph", folder: CLOUDINARY_FOLDERS.profile },
      {
        kind: "group",
        key: "news",
        label: "News & Media Recognition",
        help: "Newspaper clippings and press coverage, shown on /about after My Story. Images are shown whole — never cropped.",
        fields: [
          { kind: "text", key: "label", label: "Section label", placeholder: "In the News" },
          { kind: "text", key: "heading", label: "Heading", required: true },
          { kind: "textarea", key: "intro", label: "Introduction (optional)", rows: 2 },
          {
            kind: "list",
            key: "items",
            label: "Clippings",
            itemLabel: "Clipping",
            visibleField: "published",
            summary: (item) => [str(item.publication), str(item.date)].filter(Boolean).join(" · ") || "Untitled clipping",
            newItem: () => ({ image: { url: "", publicId: "" }, published: true }),
            fields: [
              { kind: "image", key: "image", label: "Clipping image", folder: CLOUDINARY_FOLDERS.media, help: "Add alt text describing the article." },
              { kind: "text", key: "publication", label: "Publication / newspaper" },
              { kind: "textarea", key: "headline", label: "Headline or short description (optional)", rows: 2 },
              { kind: "text", key: "date", label: "Publication date (optional)", placeholder: "12 March 2019" },
            ],
          },
        ],
      },
      {
        kind: "group",
        key: "expertise",
        label: "Areas of expertise",
        fields: [
          { kind: "text", key: "heading", label: "Heading", required: true },
          { kind: "text", key: "subtitle", label: "Label" },
          { kind: "strings", key: "intro", label: "Introduction", itemLabel: "Paragraph", multiline: true },
          {
            kind: "list",
            key: "items",
            label: "Areas",
            itemLabel: "Area",
            visibleField: "published",
            fields: profileItemFields(true),
            summary: (item) => str(item.title),
            newItem: () => ({ title: "", description: "" }),
          },
          {
            kind: "group",
            key: "distinctiveStrength",
            label: "Distinctive strength",
            fields: [
              { kind: "text", key: "heading", label: "Heading" },
              { kind: "strings", key: "paragraphs", label: "Paragraphs", itemLabel: "Paragraph", multiline: true },
            ],
          },
        ],
      },
      {
        kind: "group",
        key: "philosophy",
        label: "Leadership philosophy",
        fields: [
          { kind: "text", key: "heading", label: "Heading", required: true },
          { kind: "textarea", key: "subtitle", label: "Highlighted line", rows: 2 },
          { kind: "strings", key: "paragraphs", label: "Paragraphs", itemLabel: "Paragraph", multiline: true },
          { kind: "image", key: "image", label: "Photograph", folder: CLOUDINARY_FOLDERS.profile },
          { kind: "textarea", key: "quote", label: "Panel quotation (optional)", rows: 2, help: "Approved quotation for the burgundy panel; the highlighted line is used when empty." },
        ],
      },
      {
        kind: "group",
        key: "page",
        label: "Page labels & SEO",
        fields: [
          { kind: "text", key: "eyebrow", label: "Eyebrow" },
          { kind: "text", key: "title", label: "Page heading", required: true },
          { kind: "textarea", key: "metaDescription", label: "Search description", rows: 2 },
          { kind: "text", key: "biographyLabel", label: "Biography label" },
          { kind: "text", key: "biographyHeading", label: "Biography heading" },
          { kind: "text", key: "milestonesLabel", label: "Milestones label" },
          { kind: "text", key: "milestonesHeading", label: "Milestones heading" },
          { kind: "text", key: "milestonesIntro", label: "Milestones introduction" },
          { kind: "text", key: "recognitionLabel", label: "Awards label" },
          { kind: "text", key: "leadershipLabel", label: "Leadership label" },
        ],
      },
    ],
  },
];

export const AWARDS_FIELDS: FieldDef[] = [
  { kind: "text", key: "heading", label: "Heading", required: true },
  { kind: "text", key: "tagline", label: "Tagline" },
  {
    kind: "list",
    key: "groups",
    label: "Award groups",
    itemLabel: "Group",
    summary: (item) => str(item.heading),
    newItem: () => ({ heading: "", items: [] }),
    fields: [
      { kind: "text", key: "heading", label: "Group heading", required: true },
      {
        kind: "list",
        key: "items",
        label: "Awards",
        itemLabel: "Award",
        summary: (item) => str(item.title),
        newItem: () => ({ title: "", description: "" }),
        fields: profileItemFields(false),
      },
    ],
  },
  {
    kind: "list",
    key: "gallery",
    label: "Recognition gallery",
    help: "Newspaper cuttings, award photos, plaques and certificates. The first visible image is featured large. Images are shown whole — never cropped.",
    itemLabel: "Image",
    visibleField: "published",
    summary: (item) => [str(item.title), str(item.organisation), str(item.year)].filter(Boolean).join(" · ") || "Untitled",
    newItem: () => ({ image: { url: "", publicId: "" }, published: true }),
    fields: [
      { kind: "image", key: "image", label: "Image", folder: CLOUDINARY_FOLDERS.achievements, help: "Add alt text describing the cutting or award." },
      { kind: "text", key: "title", label: "Publication or award" },
      { kind: "text", key: "organisation", label: "Organisation" },
      { kind: "text", key: "year", label: "Date / year" },
      { kind: "text", key: "category", label: "Category (optional)", placeholder: "Journalism award, International recognition" },
      { kind: "textarea", key: "description", label: "Short description (optional)", rows: 2 },
    ],
  },
];

export const TIMELINE_FIELDS: FieldDef[] = [
  { kind: "text", key: "year", label: "Year / marker", required: true, placeholder: "2016, 15,000+ or Next" },
  { kind: "text", key: "title", label: "Title", required: true },
  { kind: "textarea", key: "description", label: "Description", rows: 3, help: "Shown on the /about page." },
  {
    kind: "image",
    key: "image",
    label: "Photograph",
    folder: CLOUDINARY_FOLDERS.timeline,
    caption: true,
    help: "Any shape (portrait, landscape, certificate) is shown whole at its own proportions. Optional — only a photo that belongs to this milestone. Shown on /about (Growth Through Time).",
  },
  {
    kind: "select",
    key: "kind",
    label: "Style",
    options: [
      { value: "milestone", label: "Milestone (achieved)" },
      { value: "figure", label: "Key figure" },
      { value: "vision", label: "Vision (future ambition)" },
    ],
  },
];

const iconOptions = ICON_NAMES.map((name) => ({ value: name, label: name }));

export const WORK_FIELDS: FieldDef[] = [
  { kind: "text", key: "title", label: "Title", required: true },
  { kind: "text", key: "category", label: "Category" },
  { kind: "text", key: "tagline", label: "Tagline", help: "Shown when there is no logo." },
  { kind: "textarea", key: "description", label: "Description", required: true, rows: 3 },
  { kind: "link", key: "cta", label: "Button", help: linkHelp },
  { kind: "image", key: "logo", label: "Logo", folder: CLOUDINARY_FOLDERS.logos, crop: false },
  { kind: "select", key: "icon", label: "Icon (when there is no logo)", options: iconOptions, emptyLabel: "None" },
  {
    kind: "image",
    key: "coverImage",
    label: "Featured image",
    folder: CLOUDINARY_FOLDERS.work.covers,
    caption: true,
    help: "The card image (shown 7:3) and the detail page's featured image (shown whole).",
  },
  {
    kind: "text",
    key: "slug",
    label: "Detail page address",
    placeholder: "channeliam",
    help: "Lowercase letters, numbers and hyphens. When set, the card opens /work/<address> instead of the button link above.",
  },
  {
    kind: "group",
    key: "detail",
    label: "Detail page",
    help: "Shown at /work/<address>. Blocks left empty are hidden.",
    fields: [
      { kind: "text", key: "title", label: "Page heading", help: "Leave empty to use the title above." },
      { kind: "textarea", key: "intro", label: "Introduction", rows: 3, help: "Under the heading. Leave empty to use the description above." },
      { kind: "text", key: "organisation", label: "Client / organisation (optional)" },
      { kind: "text", key: "period", label: "Date or period (optional)", placeholder: "2020–2021" },
      { kind: "text", key: "aboutHeading", label: "About heading", placeholder: "About Channeliam" },
      { kind: "strings", key: "paragraphs", label: "About paragraphs", itemLabel: "Paragraph", multiline: true },
      {
        kind: "list",
        key: "highlights",
        label: "Key figures",
        itemLabel: "Figure",
        summary: (item) => [str(item.value), str(item.label)].filter(Boolean).join(" · "),
        newItem: () => ({ value: "", label: "" }),
        fields: [
          { kind: "text", key: "value", label: "Figure", placeholder: "15,000+" },
          { kind: "text", key: "label", label: "Label", placeholder: "Business stories" },
        ],
      },
      {
        kind: "text",
        key: "expertiseAnchor",
        label: "Area of expertise (anchor id)",
        help: "Shows that area from the About page's profile, e.g. media-entrepreneurship.",
      },
      {
        kind: "strings",
        key: "milestoneIds",
        label: "Journey milestones (timeline ids)",
        itemLabel: "Timeline id",
        help: "Timeline entries shown on the page, in this order, e.g. t03.",
      },
      { kind: "link", key: "cta", label: "Call to action", optional: true, help: "e.g. Visit Channeliam → https://channeliam.com. External sites open in a new tab." },
      {
        kind: "group",
        key: "seo",
        label: "Search & sharing (optional)",
        fields: [
          { kind: "text", key: "title", label: "SEO title" },
          { kind: "textarea", key: "description", label: "SEO description", rows: 2 },
        ],
      },
    ],
  },
  {
    kind: "images",
    key: "gallery",
    label: "Detail page gallery",
    folder: CLOUDINARY_FOLDERS.work.covers,
    caption: true,
    help: "Supporting images, in this order. Shown whole; click opens a larger view.",
  },
];

export const WORK_COPY_FIELDS: FieldDef[] = [
  { kind: "text", key: "label", label: "Section label" },
  { kind: "text", key: "heading", label: "Heading", required: true },
  { kind: "link", key: "cta", label: "Section link (optional)", optional: true, help: linkHelp },
  {
    kind: "group",
    key: "detail",
    label: "Detail page labels",
    fields: [
      { kind: "text", key: "backLabel", label: "Back link", required: true },
      { kind: "text", key: "aboutLabel", label: "About label", required: true },
      { kind: "text", key: "highlightsLabel", label: "Key figures heading", required: true },
      { kind: "text", key: "workLabel", label: "Area of expertise label", required: true },
      { kind: "text", key: "strengthsLabel", label: "Core strengths label", required: true },
      { kind: "text", key: "milestonesLabel", label: "Milestones heading", required: true },
      { kind: "text", key: "galleryLabel", label: "Gallery heading", required: true },
    ],
  },
];

export const MEDIA_FIELDS: FieldDef[] = [
  { kind: "text", key: "publication", label: "Publication", required: true },
  { kind: "text", key: "articleUrl", label: "Article link", placeholder: "https://…" },
  { kind: "image", key: "logo", label: "Logo", folder: CLOUDINARY_FOLDERS.logos, help: "Optional. Without a logo the name is shown.", crop: false },
];

export const MEDIA_COPY_FIELDS: FieldDef[] = [
  { kind: "text", key: "label", label: "Section label" },
  { kind: "text", key: "heading", label: "Heading", required: true },
  { kind: "text", key: "tagline", label: "Tagline" },
];

export const PHILOSOPHY_FIELDS: FieldDef[] = [
  { kind: "textarea", key: "quote", label: "Quote", required: true, rows: 3 },
  { kind: "text", key: "supportingText", label: "Supporting line" },
  { kind: "text", key: "author", label: "Attribution" },
  { kind: "image", key: "image", label: "Image", folder: CLOUDINARY_FOLDERS.profile },
];

export const INSIGHTS_COPY_FIELDS: FieldDef[] = [
  { kind: "text", key: "label", label: "Section label" },
  { kind: "text", key: "heading", label: "Heading", required: true },
  { kind: "textarea", key: "intro", label: "Introduction", rows: 2 },
  { kind: "link", key: "cta", label: "Link to all articles (optional)", optional: true, help: "e.g. /insights" },
  { kind: "text", key: "emptyText", label: "Text when no article is published" },
];

/* ------------------------------------------------------------------ */
/* More content                                                        */
/* ------------------------------------------------------------------ */

export const EVENT_FIELDS: FieldDef[] = [
  { kind: "text", key: "title", label: "Talk / session title", required: true },
  { kind: "text", key: "event", label: "Event", required: true },
  { kind: "text", key: "location", label: "Location" },
  { kind: "date", key: "date", label: "Date" },
  { kind: "text", key: "url", label: "Event link", placeholder: "https://…" },
  { kind: "image", key: "image", label: "Image", folder: CLOUDINARY_FOLDERS.speaking },
  { kind: "images", key: "gallery", label: "Gallery", folder: CLOUDINARY_FOLDERS.speaking },
];

export const TESTIMONIAL_FIELDS: FieldDef[] = [
  { kind: "textarea", key: "quote", label: "Quote", required: true, rows: 4 },
  { kind: "text", key: "name", label: "Full name", required: true },
  { kind: "text", key: "role", label: "Designation" },
  { kind: "text", key: "organisation", label: "Company" },
  { kind: "image", key: "avatar", label: "Portrait", folder: CLOUDINARY_FOLDERS.testimonials, help: "Square crop works best." },
  {
    kind: "image",
    key: "logo",
    label: "Company logo",
    folder: CLOUDINARY_FOLDERS.logos,
    help: "Optional. A transparent PNG or SVG.",
    crop: false,
  },
];

export const TESTIMONIALS_COPY_FIELDS: FieldDef[] = [
  { kind: "text", key: "label", label: "Section label" },
  { kind: "text", key: "heading", label: "Heading", required: true },
  { kind: "textarea", key: "intro", label: "Introduction", rows: 2 },
  {
    kind: "images",
    key: "images",
    label: "Testimonial images",
    folder: CLOUDINARY_FOLDERS.testimonials,
    help: "Each image already contains its testimonial. Shown in this order; the homepage shows them in a carousel and /testimonials shows all. Give each image alt text describing whose testimonial it is.",
  },
  { kind: "link", key: "cta", label: "“View more” button", optional: true, help: "e.g. View More Testimonials → /testimonials" },
];

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const SETTINGS_FIELDS: FieldDef[] = [
  { kind: "text", key: "siteName", label: "Site name", required: true, help: "Shown in the header." },
  { kind: "strings", key: "roles", label: "Roles", itemLabel: "Role" },
  {
    kind: "list",
    key: "navigation",
    label: "Navigation",
    itemLabel: "Link",
    help: linkHelp,
    summary: (item) => `${str(item.label)} → ${str(item.href)}`,
    newItem: () => ({ label: "", href: "/" }),
    fields: [
      { kind: "text", key: "label", label: "Text", required: true },
      { kind: "text", key: "href", label: "Link", required: true },
    ],
  },
  { kind: "link", key: "connectCta", label: "Header button", help: linkHelp },
  {
    kind: "group",
    key: "footer",
    label: "Footer",
    fields: [
      { kind: "textarea", key: "description", label: "Description", rows: 2 },
      { kind: "text", key: "quickLinksTitle", label: "Links heading" },
      { kind: "text", key: "connectTitle", label: "Contact heading" },
      { kind: "textarea", key: "connectText", label: "Contact text", rows: 2 },
      { kind: "text", key: "contactEmail", label: "Contact email", help: "Shown only when set." },
      { kind: "text", key: "copyright", label: "Copyright line" },
      {
        kind: "list",
        key: "legalLinks",
        label: "Legal links",
        itemLabel: "Link",
        summary: (item) => str(item.label),
        newItem: () => ({ label: "", href: "/" }),
        fields: [
          { kind: "text", key: "label", label: "Text", required: true },
          { kind: "text", key: "href", label: "Link", required: true },
        ],
      },
    ],
  },
  {
    kind: "group",
    key: "seo",
    label: "Search & sharing (SEO)",
    fields: [
      { kind: "text", key: "title", label: "Default page title", required: true },
      { kind: "text", key: "titleTemplate", label: "Title template", required: true, help: "%s is replaced by the page title, e.g. %s | Nisha Krishnan." },
      { kind: "textarea", key: "description", label: "Description", rows: 3 },
      { kind: "strings", key: "keywords", label: "Keywords", itemLabel: "Keyword" },
      { kind: "text", key: "siteUrl", label: "Site URL", required: true, placeholder: "https://…" },
      { kind: "image", key: "ogImage", label: "Share image", folder: CLOUDINARY_FOLDERS.site, help: "Shown when the site is shared on social media (1200×630 recommended)." },
    ],
  },
];

export const SOCIAL_FIELDS: FieldDef[] = [
  {
    kind: "select",
    key: "platform",
    label: "Platform",
    options: [
      { value: "linkedin", label: "LinkedIn" },
      { value: "x", label: "X (Twitter)" },
      { value: "instagram", label: "Instagram" },
      { value: "youtube", label: "YouTube" },
      { value: "facebook", label: "Facebook" },
      { value: "email", label: "Email" },
    ],
  },
  { kind: "text", key: "label", label: "Label", required: true },
  { kind: "text", key: "url", label: "Address", required: true, placeholder: "https://… or mailto:…" },
];

/* ------------------------------------------------------------------ */
/* Media & Press, Video Gallery, Ecosystem Enabler, Avatar video        */
/* ------------------------------------------------------------------ */

export const PRESS_CATEGORY_OPTIONS = [
  { value: "newspaper", label: "Newspaper" },
  { value: "magazine", label: "Magazine" },
  { value: "online", label: "Online" },
  { value: "interview", label: "Interviews" },
  { value: "feature", label: "Features" },
  { value: "other", label: "Others" },
];

export const VIDEO_CATEGORY_OPTIONS = [
  { value: "talk", label: "Talks" },
  { value: "interview", label: "Interviews" },
  { value: "panel", label: "Panel Discussions" },
  { value: "event", label: "Event Highlights" },
  { value: "short", label: "Shorts" },
];

export const PRESS_FIELDS: FieldDef[] = [
  { kind: "text", key: "headline", label: "Headline", required: true },
  { kind: "text", key: "publication", label: "Publication", required: true },
  { kind: "date", key: "date", label: "Publication date" },
  { kind: "select", key: "category", label: "Category", options: PRESS_CATEGORY_OPTIONS },
  { kind: "textarea", key: "description", label: "Description", rows: 3 },
  {
    kind: "images",
    key: "images",
    label: "Clipping images",
    folder: CLOUDINARY_FOLDERS.media,
    crop: false,
    help: "Upload the newspaper cutting(s) from your computer. The first image is the cover. Add alt text describing each cutting.",
  },
  { kind: "text", key: "url", label: "Original article link (optional)", placeholder: "https://…" },
  { kind: "toggle", key: "featured", label: "Featured article", help: "The first featured article is shown large at the top of /media." },
];

export const VIDEO_FIELDS: FieldDef[] = [
  { kind: "youtube", key: "youtubeUrl", label: "YouTube URL", required: true },
  { kind: "text", key: "title", label: "Title", required: true },
  { kind: "select", key: "category", label: "Category", options: VIDEO_CATEGORY_OPTIONS },
  { kind: "date", key: "date", label: "Date" },
  { kind: "text", key: "duration", label: "Duration (optional)", placeholder: "12:45" },
  { kind: "textarea", key: "description", label: "Description", rows: 3 },
  {
    kind: "image",
    key: "thumbnail",
    label: "Custom thumbnail (optional)",
    folder: CLOUDINARY_FOLDERS.media,
    help: "Leave empty to use the YouTube thumbnail.",
  },
  { kind: "toggle", key: "featured", label: "Featured video" },
];

export const ECOSYSTEM_PAGE_FIELDS: FieldDef[] = [
  {
    kind: "select",
    key: "title",
    label: "Page title",
    options: [
      { value: "Ecosystem Enabler", label: "Ecosystem Enabler" },
      { value: "Ecosystem Builder", label: "Ecosystem Builder" },
    ],
  },
  { kind: "textarea", key: "intro", label: "Introduction", rows: 4 },
  { kind: "image", key: "heroImage", label: "Hero photograph", folder: CLOUDINARY_FOLDERS.speaking, help: "An event or speaking photograph." },
  {
    kind: "group",
    key: "impact",
    label: "Impact & Connections",
    fields: [
      { kind: "text", key: "heading", label: "Heading" },
      { kind: "strings", key: "paragraphs", label: "Paragraphs", itemLabel: "Paragraph", multiline: true },
      { kind: "image", key: "image", label: "Image", folder: CLOUDINARY_FOLDERS.speaking },
    ],
  },
];

export const ECOSYSTEM_EVENT_FIELDS: FieldDef[] = [
  { kind: "text", key: "name", label: "Event title", required: true },
  { kind: "text", key: "summit", label: "Organisation or event name" },
  { kind: "text", key: "date", label: "Date or year", placeholder: "2024 or 2024-03-12" },
  { kind: "text", key: "location", label: "Location" },
  { kind: "text", key: "role", label: "Role / participation", placeholder: "Speaker, Panelist, Moderator…" },
  { kind: "text", key: "category", label: "Category", placeholder: "Summit, Conference, Panel…" },
  { kind: "textarea", key: "description", label: "Description", rows: 3 },
  {
    kind: "images",
    key: "images",
    label: "Photographs",
    folder: CLOUDINARY_FOLDERS.speaking,
    crop: false,
    help: "At least one. The first is the cover. To reuse an uploaded photo, click “Add image” → “Choose from library” (no new upload).",
  },
  { kind: "text", key: "url", label: "Event link (optional)", placeholder: "https://…" },
  { kind: "toggle", key: "featured", label: "Featured event" },
  {
    kind: "toggle",
    key: "aboutHighlight",
    label: "Show on About page",
    help: "Adds this event to the Ecosystem Builder gallery on /about (when the event is visible and published).",
  },
];

export const AVATAR_FIELDS: FieldDef[] = [
  { kind: "toggle", key: "enabled", label: "Show the button on the homepage" },
  { kind: "text", key: "label", label: "Button label", placeholder: "Meet My Avatar" },
  { kind: "text", key: "title", label: "Video title" },
  {
    kind: "text",
    key: "url",
    label: "Video URL",
    placeholder: "https://…",
    help: "A YouTube link, or a direct video file link (e.g. a Cloudinary .mp4).",
  },
  { kind: "image", key: "poster", label: "Poster image (optional)", folder: CLOUDINARY_FOLDERS.site },
];

export const EDITORIAL_CATEGORY_OPTIONS = [
  { value: "editorial", label: "Editorials" },
  { value: "business", label: "Business" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "leadership", label: "Leadership" },
  { value: "innovation", label: "Innovation" },
  { value: "interview", label: "Interviews" },
];

/** Same fields as the Video Gallery, with the editorial categories. */
export const EDITORIAL_VIDEO_FIELDS: FieldDef[] = VIDEO_FIELDS.map((f) =>
  f.kind === "select" && f.key === "category" ? { ...f, options: EDITORIAL_CATEGORY_OPTIONS } : f,
);

/** /about "Ecosystem Builder" - stored in ecosystem/main -> about. */
export const ECOSYSTEM_ABOUT_FIELDS: FieldDef[] = [
  {
    kind: "group",
    key: "about",
    label: "Ecosystem Builder (About page)",
    fields: [
      { kind: "text", key: "heading", label: "Heading", placeholder: "Building Ecosystems Through Collaboration" },
      { kind: "strings", key: "intro", label: "Introduction", itemLabel: "Paragraph", multiline: true },
      { kind: "image", key: "featuredImage", label: "Featured image", folder: CLOUDINARY_FOLDERS.speaking },
      {
        kind: "images",
        key: "images",
        label: "Supporting images",
        folder: CLOUDINARY_FOLDERS.speaking,
        caption: true,
        help: "Shown in this order. Add a caption to each (event, place, role). Use Choose from library to reuse images already uploaded.",
      },
    ],
  },
];
