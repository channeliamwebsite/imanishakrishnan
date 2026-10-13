"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { TESTIMONIAL_FIELDS, TESTIMONIALS_COPY_FIELDS } from "@/lib/cms/forms";
import { siteSettings as builtInSettings } from "@/lib/content/placeholder";

export default function TestimonialsAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Testimonials"
        description="Testimonial images shown on the homepage and on /testimonials. The homepage section is hidden until at least one image is published."
      />
      <SectionEditor
        section="siteSettings"
        path={["sections", "testimonials"]}
        initial={builtInSettings.sections.testimonials}
        title="Testimonial images & heading"
        fields={TESTIMONIALS_COPY_FIELDS}
        preview="settings-testimonials"
        sharedNote="This is part of Site settings: publishing also publishes saved changes made on the Settings, Work, Media and Insights pages."
      />
      <div className="space-y-4">
        <Notice tone="info">
          Written testimonials below are stored but not shown on the website — the site shows the testimonial images
          above.
        </Notice>
        <SectionEditor
          section="testimonials"
          title="Written testimonials"
          fields={TESTIMONIAL_FIELDS}
          itemLabel="Testimonial"
          summary={(item) => [item.name, item.organisation].filter(Boolean).join(" · ")}
        />
      </div>
    </div>
  );
}
