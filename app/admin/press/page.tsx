"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { PRESS_FIELDS } from "@/lib/cms/forms";

export default function PressAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Media & Press"
        description="Newspaper clippings and press coverage shown on /media."
      />
      <SectionEditor
        section="press"
        title="Articles"
        fields={PRESS_FIELDS}
        itemLabel="Article"
        summary={(item) => [item.featured ? "★" : "", item.publication, item.headline].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
