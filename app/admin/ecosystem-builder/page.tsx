"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { ECOSYSTEM_ABOUT_FIELDS } from "@/lib/cms/forms";

export default function EcosystemBuilderAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Ecosystem Builder" description="The Ecosystem Builder section of the /about page." />
      <Notice tone="info">
        Event highlights reuse the events of the{" "}
        <Link href="/admin/ecosystem" className="underline">
          Ecosystem Enabler
        </Link>{" "}
        page — switch on “Highlight on the About page” for an event there. No records are duplicated.
      </Notice>
      <SectionEditor
        section="ecosystem"
        title="About-page section"
        fields={ECOSYSTEM_ABOUT_FIELDS}
        sharedNote="This section is stored with the Ecosystem Enabler page text: publishing here also publishes saved changes made to that page text."
      />
    </div>
  );
}
