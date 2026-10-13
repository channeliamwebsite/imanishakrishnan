"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { WORK_COPY_FIELDS, WORK_FIELDS } from "@/lib/cms/forms";

export default function WorkAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader title="Work" description="The initiatives shown in the Selected Work & Impact section." />
      <SectionEditor
        section="work"
        title="Initiatives"
        fields={WORK_FIELDS}
        itemLabel="Initiative"
        summary={(item) => String(item.title ?? "")}
        preview="work"
      />
      <SectionEditor
        section="siteSettings"
        path={["sections", "work"]}
        title="Section heading"
        fields={WORK_COPY_FIELDS}
        preview="settings-work"
        sharedNote="Section headings are part of Site settings: this also publishes saved changes made on the Settings, Media and Insights pages."
      />
    </div>
  );
}
