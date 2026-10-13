"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { HERO_FIELDS } from "@/lib/cms/forms";

export default function HomepageAdminPage() {
  return (
    <>
      <AdminPageHeader title="Hero" description="The first screen of the homepage: name, introduction, buttons and portrait." />
      <SectionEditor section="hero" title="Hero" fields={HERO_FIELDS} preview="hero" />
    </>
  );
}
