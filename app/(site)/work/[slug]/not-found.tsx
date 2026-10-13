import { SECTION_IDS, sectionHref } from "@/lib/sections";
import { Button } from "@/components/ui/Button";

/** Unknown /work/{slug}: rendered inside the site chrome, with a way back to the section. */
export default function WorkNotFound() {
  return (
    <section className="section-y">
      <div className="container-site">
        <p className="type-label text-rose">404</p>
        <h1 className="type-h1 mt-4 text-foreground">Page not found</h1>
        <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
        <p className="type-lead mt-6 max-w-[48rem] text-foreground/85">
          This initiative page doesn&apos;t exist or is no longer published.
        </p>
        <div className="mt-10">
          <Button href={sectionHref(SECTION_IDS.impact)}>Selected Work &amp; Impact</Button>
        </div>
      </div>
    </section>
  );
}
