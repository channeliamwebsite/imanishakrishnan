import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkDetail, getWorkDetailSlugs } from "@/lib/content";
import { workPath } from "@/lib/sections";
import { WorkDetailView } from "@/components/work/WorkDetailView";
import { breadcrumbLd, getSiteUrl, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

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
  return pageMetadata({
    title: item.detail?.seo?.title ?? item.detail?.title ?? item.title,
    description: item.detail?.seo?.description ?? item.detail?.intro ?? item.description,
    path: workPath(item.slug!),
    image: item.coverImage,
  });
}

export default async function WorkDetailPage({ params }: PageProps<"/work/[slug]">) {
  const content = await getWorkDetail((await params).slug);
  if (!content) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd(await getSiteUrl(), [{ name: content.item.title, path: workPath(content.item.slug!) }])} />
      <WorkDetailView {...content} />
    </>
  );
}
