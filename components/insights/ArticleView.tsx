import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Insight } from "@/types/content";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";

// "APR 12, 2026" — uppercase comes from the type-meta token (same format as the Insights cards).
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/**
 * A blog article. `html` must already be sanitised (lib/content/html.ts). Rendered by
 * app/(site)/insights/[slug]/page.tsx and by the admin preview.
 */
export function ArticleView({ article, html }: { article: Insight; html: string }) {
  const categories = [article.category, ...(article.categories ?? [])].filter(Boolean);
  return (
    <article className="section-y">
      <div className="container-site">
        <Reveal className="max-w-[46rem]">
          <Link href="/insights" className="type-button inline-flex items-center gap-2 text-burgundy hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> All insights
          </Link>
          {categories.length > 0 && <p className="type-label mt-8 text-rose">{categories.join(" · ")}</p>}
          <h1 className="type-h1 mt-4 text-foreground">{article.title}</h1>
          <p className="type-meta mt-5 flex flex-wrap items-center gap-x-2 text-subtle">
            <time dateTime={article.publishedAt}>{dateFormat.format(new Date(article.publishedAt))}</time>
            {article.author && (
              <>
                <span aria-hidden>·</span>
                <span>{article.author}</span>
              </>
            )}
          </p>
          {article.excerpt && <p className="type-lead mt-6 text-foreground/85">{article.excerpt}</p>}
        </Reveal>

        {article.coverImage?.url && (
          <MediaImage media={article.coverImage} ratio="13/5" sizes="(min-width: 1360px) 1280px, 100vw" preload className="mt-10" />
        )}

        {/* Sanitised HTML from the admin's rich-text editor. */}
        <div className="article-body type-body mt-10 max-w-[46rem] text-foreground/85" dangerouslySetInnerHTML={{ __html: html }} />

        {article.tags && article.tags.length > 0 && (
          <ul className="mt-10 flex max-w-[46rem] flex-wrap gap-2 border-t hairline pt-6" aria-label="Tags">
            {article.tags.map((tag) => (
              <li key={tag} className="type-meta rounded-full border hairline px-3 py-1 text-muted">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
