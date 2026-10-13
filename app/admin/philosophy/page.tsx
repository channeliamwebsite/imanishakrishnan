"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { PHILOSOPHY_FIELDS } from "@/lib/cms/forms";

export default function PhilosophyAdminPage() {
  return (
    <>
      <AdminPageHeader title="Philosophy" description="The quote panel on the homepage." />
      <SectionEditor
        section="philosophy"
        title="Philosophy"
        fields={PHILOSOPHY_FIELDS}
        preview="philosophy"
      />
    </>
  );
}
