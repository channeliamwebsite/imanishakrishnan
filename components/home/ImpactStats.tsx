import type { IconName, ImpactStatistic } from "@/types/content";
import { SECTION_IDS } from "@/lib/sections";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

/** Used by position when a statistic document has no `icon`. */
const DEFAULT_ICONS: IconName[] = ["mic", "newspaper", "building", "globe"];

/** Desktop columns follow the number of statistics (1–4) so the row always fills edge to edge. */
const DESKTOP_COLUMNS = ["lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"];

/**
 * Equal columns with hairline separators. Each statistic: line icon to the left,
 * large serif figure ("23+"), caps title ("YEARS IN MEDIA"), short description.
 * Items arrive already filtered (active) and ordered — this component only renders.
 */
export function ImpactStats({ items }: { items: ImpactStatistic[] }) {
  if (items.length === 0) return null;
  const columns = DESKTOP_COLUMNS[Math.min(items.length, 4) - 1];
  // Tablet (768–1023px): exactly three stats fit on one row; otherwise keep the 2-up grid.
  const tabletRow = items.length === 3;

  return (
    <section id={SECTION_IDS.leadership} aria-label="Impact">
      <div className="container-site">
        <ul
          className={cn(
            // Mobile: equal 2-up grid, rows separated by spacing only (no half-width rules).
            "grid grid-cols-2 gap-y-8 border-b hairline py-8",
            tabletRow && "md:grid-cols-3 md:py-10",
            "lg:gap-y-0 lg:py-[clamp(2.5rem,3.6vw,3.25rem)]",
            columns,
          )}
        >
          {items.map((stat, i) => (
            <li
              key={stat.id ?? i}
              className={cn(
                "hairline min-w-0 lg:py-1",
                // Mobile 2-up: a divider only between the two cards of a row.
                i % 2 === 1 ? "border-l pl-4 xs:pl-6" : "pr-4 xs:pr-6",
                // Tablet 3-up: dividers between all three.
                tabletRow && i === 2 && "md:border-l md:pl-8",
                tabletRow && i === 1 && "md:pr-8",
                tabletRow && i === 0 && "md:pr-8",
                // Desktop: one row (unchanged).
                "lg:px-[clamp(1.5rem,3.5vw,3.5rem)] lg:first:pl-0",
                i > 0 && "lg:border-l",
              )}
            >
              <Reveal delay={i * 0.08} className="flex flex-col gap-3 lg:flex-row lg:gap-8">
                <Icon
                  name={stat.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length]}
                  className="size-9 shrink-0 text-burgundy md:size-10 lg:size-11"
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="type-figure text-[clamp(1.875rem,7.5vw,2.25rem)] leading-none text-foreground md:text-[clamp(2.25rem,3.2vw,2.875rem)]">
                    {stat.value}
                  </p>
                  <p className="type-caps mt-1 text-foreground [overflow-wrap:anywhere]">{stat.title}</p>
                  {stat.description && (
                    <p className="type-small mt-1 max-w-[16rem] text-muted">{stat.description}</p>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
