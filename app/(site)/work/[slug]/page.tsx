import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkDetail, getWorkDetailSlugs } from "@/lib/content";
import { workPath } from "@/lib/sections";
import { WorkDetailView } from "@/components/work/WorkDetailView";

/** Never a real slug (slugs are lowercase letters, numbers and hyphens). */
const PLACEHOLDER_SLUG = "_none";

/**
 * One page per published work item with a slug (prerendered); any other slug is a 404. Cache
 * Components needs at least one param, so when no item has a slug a placeholder is returned (it 404s).
 */
export async function generateStaticParams() {
  const slugs = (await getWorkDetailSlugs()).map((slug) => ({ slug }));
  return slugs.length ? slugs : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const content = await getWorkDetail((await params).slug);
  if (!content) return {};
  const { item } = content;
  const image = item.coverImage?.url ? item.coverImage : undefined;
  const title = item.detail?.seo?.title ?? item.detail?.title ?? item.title;
  const description = item.detail?.seo?.description ?? item.detail?.intro ?? item.description;
  return {
    title,
    description,
    alternates: { canonical: workPath(item.slug!) },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function WorkDetailPage({ params }: PageProps<"/work/[slug]">) {
  const content = await getWorkDetail((await params).slug);
  if (!content) notFound();
  return <WorkDetailView {...content} />;
}
