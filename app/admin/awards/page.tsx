"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { AWARDS_FIELDS } from "@/lib/cms/forms";

export default function AwardsAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Awards"
        description="Professional achievements and recognition, shown on the /about page (#awards). The homepage figure “Awards & honours” is edited on the Statistics page."
      />
      <SectionEditor
        section="about"
        path={["profile", "achievements"]}
        title="Awards & recognition"
        fields={AWARDS_FIELDS}
        preview="profile"
        sharedNote="Awards are part of About & profile: this also publishes saved changes made on the About page."
      />
    </>
  );
}
