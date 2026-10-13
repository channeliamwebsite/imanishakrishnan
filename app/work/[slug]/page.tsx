import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkDetail, getWorkDetailSlugs } from "@/lib/content";
import { WorkDetailView } from "@/components/work/WorkDetailView";

/** One page per Selected Work item that has a detail page (prerendered); any other slug is a 404. */
export async function generateStaticParams() {
  return (await getWorkDetailSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const content = await getWorkDetail((await params).slug);
  if (!content) return {};
  const { item } = content;
  const image = item.coverImage?.url ? item.coverImage : undefined;
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/work/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export default async function WorkDetailPage({ params }: PageProps<"/work/[slug]">) {
  const content = await getWorkDetail((await params).slug);
  if (!content) notFound();
  return <WorkDetailView {...content} />;
}
