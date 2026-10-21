import type { Metadata } from "next";
import type { LegalPageContent } from "@/lib/content/legal";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";

export const legalMetadata = (page: LegalPageContent): Promise<Metadata> =>
  pageMetadata({ title: page.title, description: page.description, path: page.path });

/** Shared layout for /privacy and /terms — same page header as /testimonials. */
export function LegalPage({ page }: { page: LegalPageContent }) {
  return (
    <section className="section-y">
      <div className="container-site">
        <Reveal>
          <p className="type-label text-rose">Legal</p>
          <h1 className="type-h1 mt-4 text-foreground">{page.title}</h1>
          <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
          <div className="mt-8 max-w-[44rem] space-y-6">
            {page.intro.map((paragraph) => (
              <p key={paragraph} className="type-lead text-foreground/85">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
