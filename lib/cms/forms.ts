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
  { kind: "text", key: "eyebrow", label: "Eyebrow", help: "Small line above the name. Separate words with | ." },
  { kind: "text", key: "name", label: "Name heading", required: true, help: 'A leading "I am" / "I\'m" is set smaller above the name.' },
  { kind: "text", key: "designation", label: "Designation", required: true },
  { kind: "strings", key: "roles", label: "Roles", itemLabel: "Role", help: "Shown after the designation." },
  { kind: "textarea", key: "description", label: "Introduction", required: true, rows: 3 },
  { kind: "text", key: "location", label: "Location", help: "Separate lines with / (e.g. INDIA / UAE)." },
  { kind: "link", key: "primaryCta", label: "Main button", help: linkHelp },
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
      { kind: "textarea", key: "tagline", label: "Tagline", rows: 2 },
      { kind: "strings", key: "detailedBio", label: "Biography", itemLabel: "Paragraph", multiline: true },
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
];

export const TIMELINE_FIELDS: FieldDef[] = [
  { kind: "text", key: "year", label: "Year / marker", required: true, placeholder: "2016, 15,000+ or Next" },
  { kind: "text", key: "title", label: "Title", required: true },
  { kind: "textarea", key: "description", label: "Description", rows: 3, help: "Shown on the /about page." },
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
  { kind: "image", key: "logo", label: "Logo", folder: CLOUDINARY_FOLDERS.logos },
  { kind: "select", key: "icon", label: "Icon (when there is no logo)", options: iconOptions, emptyLabel: "None" },
  { kind: "image", key: "coverImage", label: "Cover image", folder: CLOUDINARY_FOLDERS.work.covers, help: "Also the detail page's featured image." },
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
    ],
  },
  { kind: "images", key: "gallery", label: "Detail page gallery", folder: CLOUDINARY_FOLDERS.work.covers },
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
  { kind: "image", key: "logo", label: "Logo", folder: CLOUDINARY_FOLDERS.logos, help: "Optional. Without a logo the name is shown." },
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
  { kind: "link", key: "cta", label: "“View all” button", optional: true, help: "e.g. View All Testimonials → /testimonials" },
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
