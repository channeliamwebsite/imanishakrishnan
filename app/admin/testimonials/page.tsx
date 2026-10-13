"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { TESTIMONIAL_FIELDS } from "@/lib/cms/forms";

export default function TestimonialsAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Testimonials" description="Quotes from people who have worked with Nisha." />
      <Notice tone="info">
        Testimonials can be stored and published here, but the public website has no testimonials section yet. Adding
        one is a design decision; until then, published testimonials are not shown to visitors.
      </Notice>
      <SectionEditor
        section="testimonials"
        title="Testimonials"
        fields={TESTIMONIAL_FIELDS}
        itemLabel="Testimonial"
        summary={(item) => [item.name, item.organisation].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
