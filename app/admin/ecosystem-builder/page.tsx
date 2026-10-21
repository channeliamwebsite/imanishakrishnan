"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { ECOSYSTEM_ABOUT_FIELDS } from "@/lib/cms/forms";

export default function EcosystemAboutAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Ecosystem section (About page)"
        description="The Ecosystem Enabler section of /about, between Timeline and Expertise In: heading, introduction, link text and optional photographs."
      />
      <Notice tone="info" title="Where the photographs come from">
        The section shows up to 4 photographs: the optional ones below first, then the cover photographs of the events
        marked “Show on About page” on the{" "}
        <Link href="/admin/ecosystem" className="underline">
          Ecosystem Enabler &amp; events
        </Link>{" "}
        page — or, when none are marked, the latest published events. Its link opens /ecosystem-enabler, which shows every
        published event. The section is hidden while there are no photographs.
      </Notice>
      <SectionEditor
        section="ecosystem"
        title="About-page section"
        fields={ECOSYSTEM_ABOUT_FIELDS}
        sharedNote="Stored with the Ecosystem Enabler page text: publishing here also publishes saved changes made to that page text. Events are not affected."
      />
    </div>
  );
}
