"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { ECOSYSTEM_ABOUT_FIELDS } from "@/lib/cms/forms";

export default function EcosystemBuilderAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Ecosystem Builder"
        description="The Ecosystem Builder section of the /about page, between Timeline and Expertise In."
      />
      <Notice tone="info" title="Adding events to the About page">
        Events are managed once, on the{" "}
        <Link href="/admin/ecosystem" className="underline">
          Ecosystem Enabler
        </Link>{" "}
        page (title, photographs, organisation, date or year, description). For each event to show here, switch on
        “Show on About page”, keep it visible, and publish the events list. The section appears on /about as soon as
        at least one event is selected, and disappears when none are — the events themselves are never deleted.
      </Notice>
      <SectionEditor
        section="ecosystem"
        title="Heading, introduction and images (optional)"
        fields={ECOSYSTEM_ABOUT_FIELDS}
        sharedNote="Stored with the Ecosystem Enabler page text: publishing here also publishes saved changes made to that page text. Events are not affected."
      />
    </div>
  );
}
