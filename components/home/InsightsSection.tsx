import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Insight, SectionCopy } from "@/types/content";
import { SECTION_IDS } from "@/lib/sections";
import { Card, CardBody } from "@/components/ui/Card";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const TRACK_ID = "insights-track";

// "APR 12, 2026" — uppercase comes from the type-meta token.
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function InsightsSection({
  items,
  copy,
  headingAs = "h2",
}: {
  items: Insight[];
  copy: SectionCopy["insights"];
  /** "h1" when the section is the page itself (/insights). */
  headingAs?: "h1" | "h2";
}) {
  const hasArticles = items.length > 0;
  return (
    <section id={SECTION_IDS.insights} className="section-y">
      <div className="container-site">
        <SectionHeading
          as={headingAs}
          label={copy.label}
          title={copy.heading}
          intro={copy.intro}
          introPlacement="inline"
          aside={
            hasArticles && (
              <>
                {copy.cta && (
                  <Button href={copy.cta.href} variant="text">
                    {copy.cta.label}
                  </Button>
                )}
                <CarouselNav targetId={TRACK_ID} className="hidden md:flex" />
              </>
            )
          }
        />

        {/* No published articles yet (insights collection empty): an honest note instead of sample cards. */}
        {!hasArticles && copy.emptyText && (
          <p className="type-small border-t hairline pt-6 text-muted">{copy.emptyText}</p>
        )}

        {/* Mobile: stacked. Tablet: 2 visible, scrollable. Desktop: 3. */}
        <ul id={TRACK_ID} className="grid gap-card md:scroll-track md:flex">
          {items.map((post, i) => {
            const href = `/insights/${post.slug}`;
            return (
              <li
                key={post.id}
                className="md:w-[calc((100%-var(--card-gap))/2)] md:shrink-0 lg:w-[calc((100%-2*var(--card-gap))/3)]"
              >
                <Reveal delay={i * 0.08} className="h-full">
                  <Card>
                    <Link href={href} className="block overflow-hidden" tabIndex={-1} aria-hidden>
                      <MediaImage
                        media={post.coverImage}
                        ratio="13/5"
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                        imageClassName="transition-transform duration-[400ms] ease-editorial group-hover:scale-[1.02]"
                      />
                    </Link>
                    <CardBody>
                      <p className="type-meta flex flex-wrap items-center gap-x-2 text-subtle">
                        <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
                        <span aria-hidden>·</span>
                        <span>{post.category}</span>
                      </p>
                      <h3 className="type-h3 mt-1 text-foreground">
                        <Link href={href} className="transition-colors hover:text-burgundy">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="type-small text-muted">{post.excerpt}</p>
                      <Link
                        href={href}
                        className="type-button inline-flex items-center gap-3 self-start pt-3 text-burgundy transition-colors hover:text-foreground"
                      >
                        Read More
                        <ArrowRight
                          className="size-3.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
                          aria-hidden
                        />
                      </Link>
                    </CardBody>
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
