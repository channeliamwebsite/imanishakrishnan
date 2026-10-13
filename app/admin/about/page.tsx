"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { ABOUT_FIELDS } from "@/lib/cms/forms";

export default function AboutAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="About & profile"
        description="The homepage About section and the full profile page (/about). Awards are edited on the Awards page."
      />
      <SectionEditor
        section="about"
        title="About & profile"
        fields={ABOUT_FIELDS}
        preview="about"
        sharedNote="This also publishes any saved changes made on the Awards page."
      />
    </>
  );
}
