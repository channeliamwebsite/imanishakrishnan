"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { TESTIMONIAL_FIELDS, TESTIMONIALS_COPY_FIELDS } from "@/lib/cms/forms";
import { siteSettings as builtInSettings } from "@/lib/content/placeholder";

export default function TestimonialsAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Testimonials"
        description="Quotes shown in the homepage Testimonials section. The section is hidden until at least one testimonial is published and visible."
      />
      <SectionEditor
        section="testimonials"
        title="Testimonials"
        fields={TESTIMONIAL_FIELDS}
        itemLabel="Testimonial"
        summary={(item) => [item.name, item.organisation].filter(Boolean).join(" · ")}
        preview="testimonials"
      />
      <SectionEditor
        section="siteSettings"
        path={["sections", "testimonials"]}
        initial={builtInSettings.sections.testimonials}
        title="Section heading"
        fields={TESTIMONIALS_COPY_FIELDS}
        preview="settings-testimonials"
        sharedNote="Section headings are part of Site settings: this also publishes saved changes made on the Settings, Work, Media and Insights pages."
      />
    </div>
  );
}
