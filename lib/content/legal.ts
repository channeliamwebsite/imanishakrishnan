import type { Link } from "@/types/content";

export type LegalPageContent = {
  path: "/privacy" | "/terms";
  title: string;
  /** Meta description. */
  description: string;
  /** Client-supplied introductory text, verbatim. */
  intro: string[];
};

// Introductory text supplied by the client. It is not a complete legal agreement, and no full
// policy exists yet, so the closing "review our full Privacy Policy" / "Full Terms of Service
// available here" sentences are left out rather than pointing at a document that does not exist.
export const privacyPage: LegalPageContent = {
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "How information shared on iamnisha.in through contact forms, subscriptions or collaborations is used. We do not sell or share your data with third parties.",
  intro: [
    "Your privacy matters to us. Any information you share on this platform—whether through contact forms, subscriptions, or collaborations—will be used solely to connect with you and provide relevant updates. We do not sell or share your data with third parties.",
  ],
};

export const termsPage: LegalPageContent = {
  path: "/terms",
  title: "Terms of Service",
  description:
    "Terms for using iamnisha.in. All media, visuals and content on this site are protected under intellectual property rights and cannot be reproduced without prior consent.",
  intro: [
    "By accessing iamnisha.in, you agree to engage respectfully with the content and services provided. All media, visuals, and content on this site are protected under intellectual property rights and cannot be reproduced without prior consent. For collaborations or media usage rights, please contact directly.",
  ],
};

/** Always shown in the footer, after any legal links set in the admin (no duplicates by address). */
export const LEGAL_LINKS: Link[] = [privacyPage, termsPage].map((page) => ({ label: page.title, href: page.path }));
