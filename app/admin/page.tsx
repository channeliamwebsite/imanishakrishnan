"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Badge, Notice, Panel, Spinner } from "@/components/admin/ui";
import type { SectionKey } from "@/lib/cms/sections";
import { loadSection, type SectionState } from "@/lib/cms/store";

/** Where each section is edited. */
const SECTION_PAGES: { key: SectionKey; label: string; href: string }[] = [
  { key: "hero", label: "Hero", href: "/admin/homepage" },
  { key: "statistics", label: "Statistics", href: "/admin/statistics" },
  { key: "about", label: "About, profile & awards", href: "/admin/about" },
  { key: "timeline", label: "Timeline", href: "/admin/timeline" },
  { key: "work", label: "Work", href: "/admin/work" },
  { key: "mediaFeatures", label: "Media mentions", href: "/admin/media" },
  { key: "philosophy", label: "Philosophy", href: "/admin/philosophy" },
  { key: "siteSettings", label: "Site settings & section headings", href: "/admin/settings" },
  { key: "socialLinks", label: "Social links", href: "/admin/settings" },
  { key: "speaking", label: "Events", href: "/admin/events" },
  { key: "testimonials", label: "Testimonials", href: "/admin/testimonials" },
];

function StatusBadge({ state }: { state: SectionState }) {
  if (state.dirty) return <Badge tone="draft">Unpublished changes</Badge>;
  if (state.isPublished) return <Badge tone="live">Live</Badge>;
  return <Badge tone="muted">Built-in content</Badge>;
}

export default function AdminDashboard() {
  const [states, setStates] = useState<Partial<Record<SectionKey, SectionState>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(SECTION_PAGES.map(async ({ key }) => [key, await loadSection(key)] as const))
      .then((entries) => setStates(Object.fromEntries(entries)))
      .catch(() => setError("Could not load the content status. Check your connection and reload."));
  }, []);

  const neverPublished = states ? SECTION_PAGES.filter(({ key }) => !states[key]?.isPublished).length : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Edit a section, preview it, and publish when it's ready. Saved drafts never change the live website."
      />
      {error && <Notice tone="error">{error}</Notice>}
      {states && neverPublished > 0 && (
        <Notice tone="info" title="Some sections still use the built-in content">
          The live site shows the original built-in content for {neverPublished} section{neverPublished === 1 ? "" : "s"}.
          Opening one starts from exactly that content; publishing it once moves it into the CMS without changing what
          visitors see.
        </Notice>
      )}
      <Panel title="Content">
        {!states && !error ? (
          <Spinner />
        ) : (
          <ul className="divide-y divide-border">
            {SECTION_PAGES.map(({ key, label, href }) => {
              const state = states?.[key];
              return (
                <li key={key}>
                  <Link href={href} className="flex items-center gap-3 py-3 font-sans hover:text-burgundy">
                    <span className="flex-1 font-semibold">{label}</span>
                    {state && <StatusBadge state={state} />}
                    <ArrowRight className="size-4 text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel title="Blog">
          <p className="font-sans text-sm text-muted">Write and publish articles for the Insights pages.</p>
          <Link href="/admin/blogs" className="mt-3 inline-flex items-center gap-1 font-sans font-semibold text-burgundy">
            Manage articles <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Panel>
        <Panel title="Media library">
          <p className="font-sans text-sm text-muted">Every image uploaded through the admin, ready to reuse.</p>
          <Link href="/admin/media-library" className="mt-3 inline-flex items-center gap-1 font-sans font-semibold text-burgundy">
            Open library <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
