"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { INSIGHTS_COPY_FIELDS } from "@/lib/cms/forms";

export default function InsightsAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Insights section"
        description={
          <>
            The heading of the homepage Insights section. Articles are managed under{" "}
            <Link href="/admin/blogs" className="text-burgundy underline underline-offset-4">
              Articles
            </Link>
            ; the three newest published articles appear on the homepage.
          </>
        }
      />
      <SectionEditor
        section="siteSettings"
        path={["sections", "insights"]}
        title="Section heading"
        fields={INSIGHTS_COPY_FIELDS}
        preview="settings-insights"
        sharedNote="Section headings are part of Site settings: this also publishes saved changes made on the Settings, Work and Media pages."
      />
    </>
  );
}
