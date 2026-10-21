import type { Metadata } from "next";
import NextImage from "next/image";
import { getEcosystemEvents, getEcosystemPage, getEcosystemVideos } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EcosystemSections } from "@/components/ecosystem/EcosystemSections";

const TITLE = "Ecosystem Engagements";
/** Default introduction (Admin → Ecosystem Enabler & events → Introduction replaces it). */
const DEFAULT_INTRO =
  "Business, entrepreneurship, innovation and leadership events Nisha Krishnan has taken part in — conversations, gatherings and engagements across the business ecosystem.";
const DESCRIPTION =
  "How Nisha Krishnan connects people, ideas, institutions, businesses and opportunities — summits, gatherings and conversations.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getEcosystemPage();
  const description = page.intro || DESCRIPTION;
  return {
    title: TITLE,
    description,
    alternates: { canonical: "/ecosystem-enabler" },
    openGraph: { title: TITLE, description, url: "/ecosystem-enabler" },
  };
}

/** Everything comes from the CMS (Ecosystem Enabler); sections without published content are omitted. */
export default async function EcosystemEnablerPage() {
  const [page, events, videos] = await Promise.all([getEcosystemPage(), getEcosystemEvents(), getEcosystemVideos()]);
  const impact = page.impact;
  const hasImpact = !!impact && (impact.paragraphs.length > 0 || !!impact.image);
  const hasEventPhotos = events.some((e) => e.images.some((m) => m.url));
  const empty = !hasEventPhotos && videos.length === 0 && !hasImpact;

  return (
    <>
      {/* A — Hero */}
      <section className="section-y">
        <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className={cn(page.heroImage ? "lg:col-span-6" : "lg:col-span-10")}>
            <p className="type-label text-rose">{page.title || "Ecosystem Enabler"}</p>
            <h1 className="type-h1 mt-4 text-foreground">{TITLE}</h1>
            <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
            <p className="type-lead mt-6 max-w-[40rem] whitespace-pre-line text-foreground/85">{page.intro || DEFAULT_INTRO}</p>
          </Reveal>
          {page.heroImage && (
            <Reveal delay={0.08} className="lg:col-span-6">
              <NextImage
                src={page.heroImage.url}
                alt={page.heroImage.alt ?? `${TITLE} — Nisha Krishnan`}
                width={page.heroImage.width ?? 1600}
                height={page.heroImage.height ?? 1100}
                sizes="(min-width: 1024px) 48vw, 100vw"
                preload
                className="h-auto w-full object-cover"
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* B–D — Event photography (grouped by event), Featured Conversations, Conversations That Matter */}
      <EcosystemSections events={events} videos={videos} />

      {/* E — Impact & Connections */}
      {hasImpact && (
        <section className="pb-section">
          <div className="container-site section-rule grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {impact!.image && (
              <Reveal className="lg:col-span-5">
                <NextImage
                  src={impact!.image.url}
                  alt={impact!.image.alt ?? "Impact & Connections"}
                  width={impact!.image.width ?? 1200}
                  height={impact!.image.height ?? 1200}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="h-auto w-full object-cover"
                />
              </Reveal>
            )}
            <Reveal className={impact!.image ? "lg:col-span-7" : "lg:col-span-10"}>
              <SectionHeading label={impact!.heading ? "Impact & Connections" : undefined} title={impact!.heading || "Impact & Connections"} />
              <div className="space-y-5">
                {impact!.paragraphs.map((p) => (
                  <p key={p} className="type-body text-foreground/85">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {empty && (
        <section className="pb-section">
          <div className="container-site">
            <p className="type-body text-muted">Events and conversations will appear here once they are published.</p>
          </div>
        </section>
      )}
    </>
  );
}
