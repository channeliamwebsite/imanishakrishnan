"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { EVENT_FIELDS } from "@/lib/cms/forms";

/**
 * Legacy events list (speaking collection). Nothing on the public site reads it; the events and
 * photographs shown on /about and /ecosystem-enabler are managed on the Ecosystem Enabler page.
 * Kept so any record saved here stays editable.
 */
export default function EventsAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Events (legacy)" description="An older events list that the website does not display." />
      <Notice tone="info" title="Add events on the Ecosystem Enabler page">
        Events and their photographs for the website are managed on{" "}
        <Link href="/admin/ecosystem" className="underline">
          Ecosystem Enabler &amp; events
        </Link>
        . They appear on /ecosystem-enabler and, when marked “Show on About page”, on /about. Records saved in this older
        list are kept below but are not shown on the website.
      </Notice>
      <SectionEditor
        section="speaking"
        title="Legacy events"
        fields={EVENT_FIELDS}
        itemLabel="Event"
        summary={(item) => [item.date, item.title].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
