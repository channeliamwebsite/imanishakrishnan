import type { TimelineEntry } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Vertical career timeline. Entries come from the `timeline` collection, ordered by `order`.
 * On desktop the entries spread to fill the column height so the rule spans the section.
 * Each milestone's text reveals as it enters the viewport (the rule and dots stay static, so
 * the line never shifts); milestones visible together unfold with a short stagger.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative flex h-full flex-col justify-between gap-8 py-1 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-rose/40">
      {entries.map((entry, i) => (
        <li key={entry.id} className="relative pl-9">
          <span aria-hidden className="absolute left-0 top-[0.55rem] size-[7px] -translate-x-[3px] rounded-full bg-burgundy" />
          <Reveal delay={i * 0.08} y={12}>
            <p className="font-serif text-[1.1875rem] font-semibold leading-tight text-burgundy">{entry.year}</p>
            <p className="type-small mt-1 max-w-[11rem] text-[0.9375rem] leading-snug text-muted">{entry.title}</p>
            {entry.description && <p className="type-small mt-1 text-subtle">{entry.description}</p>}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
