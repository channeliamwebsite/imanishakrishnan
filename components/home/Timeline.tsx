import type { TimelineEntry } from "@/types/content";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { RevealLine } from "@/components/ui/RevealLine";

/**
 * Compact career timeline rail (About section, right column on desktop — per the reference).
 * Entries come from the `timeline` collection, in `order`; each shows its year and short title
 * (descriptions stay in the data for future detail pages). On desktop the entries spread to the
 * column height so the rule spans the section. A faint track is always visible and a burgundy
 * line draws over it as each entry enters the viewport (fully drawn with reduced motion / no JS).
 * The forward-looking "vision" entry uses a dashed rose line and a hollow dot so it is never
 * read as a completed achievement.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="flex h-full flex-col lg:justify-between">
      {entries.map((entry, i) => {
        const vision = entry.kind === "vision";
        const last = i === entries.length - 1;
        return (
          <li key={entry.id} className={cn("relative pl-9", !last && "pb-7", "lg:flex-1")}>
            {/* Line segment down to the next entry */}
            {!last && (
              <span aria-hidden className="absolute bottom-0 left-0 top-[0.6rem] w-px">
                {entries[i + 1]?.kind === "vision" ? (
                  <span className="absolute inset-0 border-l border-dashed border-rose/60" />
                ) : (
                  <>
                    <span className="absolute inset-0 bg-border" />
                    <RevealLine className="absolute inset-0 bg-burgundy" delay={i * 0.05} />
                  </>
                )}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-[0.45rem] size-[7px] -translate-x-[3px] rounded-full",
                vision ? "border border-rose bg-background" : "bg-burgundy",
              )}
            />
            <Reveal delay={i * 0.06} y={10}>
              <p
                className={cn(
                  "font-serif text-[1.1875rem] font-semibold leading-tight",
                  vision ? "italic text-rose" : "text-burgundy",
                )}
              >
                {entry.year}
              </p>
              <p className="type-small mt-1 max-w-[11rem] text-[0.9375rem] leading-snug text-muted">{entry.title}</p>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
