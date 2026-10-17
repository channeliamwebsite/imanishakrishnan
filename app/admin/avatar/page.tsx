"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { AVATAR_FIELDS } from "@/lib/cms/forms";

export default function AvatarAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Avatar Video"
        description="The “Meet My Avatar” button beside the hero’s main button on the homepage. It is shown only when enabled with a video URL."
      />
      <SectionEditor section="avatar" title="Avatar video" fields={AVATAR_FIELDS} />
    </div>
  );
}
