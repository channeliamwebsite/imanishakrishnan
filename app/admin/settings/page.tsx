"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { SETTINGS_FIELDS, SOCIAL_FIELDS } from "@/lib/cms/forms";

export default function SettingsAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader title="Settings" description="Branding, navigation, footer, search engine settings and social links." />
      <SectionEditor
        section="siteSettings"
        title="Site settings"
        fields={SETTINGS_FIELDS}
        preview="settings-chrome"
        sharedNote="This also publishes saved section-heading changes made on the Work, Media and Insights pages."
      />
      <SectionEditor
        section="socialLinks"
        title="Social links"
        fields={SOCIAL_FIELDS}
        itemLabel="Link"
        summary={(item) => String(item.label ?? item.platform ?? "")}
        preview="social"
      />
    </div>
  );
}
