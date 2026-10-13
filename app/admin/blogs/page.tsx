"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Badge, Notice, Panel, Spinner } from "@/components/admin/ui";
import { listArticles, type ArticleStatus, type ArticleSummary } from "@/lib/cms/blog";

const STATUS: Record<ArticleStatus, { tone: "live" | "draft" | "muted"; label: string }> = {
  draft: { tone: "muted", label: "Draft" },
  published: { tone: "live", label: "Published" },
  changed: { tone: "draft", label: "Published · changes" },
  unpublished: { tone: "muted", label: "Unpublished" },
};

export default function BlogsAdminPage() {
  const [articles, setArticles] = useState<ArticleSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listArticles().then(setArticles, () => setError("Could not load the articles. Check your connection and reload."));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Articles"
        description="Blog articles for /insights. Only published articles are visible on the website; the three newest appear on the homepage."
        actions={
          <Link
            href="/admin/blogs/create"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-burgundy px-4 font-sans font-semibold text-white hover:bg-foreground"
          >
            <Plus className="size-4" aria-hidden /> New article
          </Link>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      <Panel>
        {!articles && !error && <Spinner />}
        {articles?.length === 0 && <p className="font-sans text-muted">No articles yet.</p>}
        {articles && articles.length > 0 && (
          <ul className="divide-y divide-border">
            {articles.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/blogs/edit/${a.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 font-sans hover:text-burgundy">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{a.title}</span>
                    <span className="block truncate text-xs text-muted">{a.slug ? `/insights/${a.slug}` : "No address yet"}</span>
                  </span>
                  {a.publishedAt && <span className="text-sm text-muted">{a.publishedAt.slice(0, 10)}</span>}
                  <Badge tone={STATUS[a.status].tone}>{STATUS[a.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
