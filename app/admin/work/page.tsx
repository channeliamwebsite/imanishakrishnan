"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { WORK_COPY_FIELDS, WORK_FIELDS } from "@/lib/cms/forms";

export default function WorkAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Work & detail pages"
        description="The Selected Work & Impact cards on the homepage and each initiative's own page (/work/…)."
      />
      <Notice tone="info" title="Editing a detail page">
        <ol className="mt-1 list-decimal space-y-0.5 pl-4">
          <li>Open an initiative below (or “Add initiative”).</li>
          <li>
            Set its <strong>Detail page address</strong> (e.g. <code>channeliam</code>) — the card then opens /work/&lt;address&gt;.
          </li>
          <li>
            Fill in <strong>Detail page</strong> (heading, introduction, organisation, period, paragraphs, key figures, call to
            action, SEO), the <strong>Featured image</strong> and the <strong>Detail page gallery</strong> (alt text and captions
            per image).
          </li>
          <li>
            Use <strong>Preview</strong> to see the card and the full detail page, then <strong>Publish</strong>. Hide an initiative
            with its eye icon; delete it with its bin icon.
          </li>
        </ol>
        <p className="mt-2">
          Article pages (/insights/…) are edited under{" "}
          <Link href="/admin/blogs" className="underline">
            Articles
          </Link>
          .
        </p>
      </Notice>
      <SectionEditor
        section="work"
        title="Initiatives"
        fields={WORK_FIELDS}
        itemLabel="Initiative"
        summary={(item) => [String(item.title ?? ""), item.slug ? `/work/${String(item.slug)}` : "card only"].join(" · ")}
        preview="work"
      />
      <SectionEditor
        section="siteSettings"
        path={["sections", "work"]}
        title="Section heading"
        fields={WORK_COPY_FIELDS}
        preview="settings-work"
        sharedNote="Section headings are part of Site settings: this also publishes saved changes made on the Settings, Media and Insights pages."
      />
    </div>
  );
}
