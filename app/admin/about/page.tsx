"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { ABOUT_FIELDS } from "@/lib/cms/forms";

export default function AboutAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="About page"
        description="The full profile page (/about) and the homepage About section."
      />
      <Notice tone="info" title="Where each /about section is edited">
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>
            <strong>Introduction</strong> (heading, tagline, portrait, quotation), <strong>My Story</strong> (biography,
            photograph), <strong>Areas of Expertise</strong> and <strong>Leadership Philosophy</strong> (text, photograph,
            quotation): below, under “Profile page (/about)”. Section labels and headings: “Page labels &amp; SEO”.
          </li>
          <li>
            <strong>Recognition</strong> (heading, description, awards, newspaper cuttings and certificates):{" "}
            <Link href="/admin/awards" className="underline">
              Awards
            </Link>
            .
          </li>
          <li>
            <strong>Growth Through Time</strong> (milestones and their photographs):{" "}
            <Link href="/admin/timeline" className="underline">
              Timeline
            </Link>
            .
          </li>
        </ul>
      </Notice>
      <SectionEditor
        section="about"
        title="About page & homepage About section"
        fields={ABOUT_FIELDS}
        preview="about"
        sharedNote="This also publishes any saved changes made on the Awards page."
      />
    </>
  );
}
