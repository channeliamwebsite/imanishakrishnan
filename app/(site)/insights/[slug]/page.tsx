import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInsightBySlug, getInsights } from "@/lib/content";
import { sanitizeArticleHtml } from "@/lib/content/html";
import { ArticleView } from "@/components/insights/ArticleView";

/** Never a real slug (slugs are lowercase letters, numbers and hyphens). */
const PLACEHOLDER_SLUG = "_none";

/**
 * Published articles are prerendered; new ones render on first request. Cache Components needs at
 * least one param, so when nothing is published yet a placeholder is returned (it 404s).
 */
export async function generateStaticParams() {
  const slugs = (await getInsights()).map((article) => ({ slug: article.slug }));
  return slugs.length ? slugs : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const article = await getInsightBySlug((await params).slug);
  if (!article) return {};
  const image = article.seo?.image?.url ? article.seo.image : article.coverImage?.url ? article.coverImage : undefined;
  const title = article.seo?.title || article.title;
  const description = article.seo?.description || article.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author] : undefined,
      tags: article.tags,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const article = await getInsightBySlug((await params).slug);
  if (!article) notFound();
  return <ArticleView article={article} html={sanitizeArticleHtml(article.body)} />;
}
