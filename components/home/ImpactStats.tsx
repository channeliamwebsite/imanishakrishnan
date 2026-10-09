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

  return (
    <section id={SECTION_IDS.leadership} aria-label="Impact">
      <div className="container-site">
        <ul className={cn("grid grid-cols-2 border-b hairline py-4 lg:py-[clamp(2.5rem,3.6vw,3.25rem)]", columns)}>
          {items.map((stat, i) => (
            <li
              key={stat.id ?? i}
              className={cn(
                "hairline py-8 lg:py-1",
                // Mobile/tablet 2-up: divider between the pair, rule between rows.
                i % 2 === 1 ? "border-l pl-5 sm:pl-8" : "pr-5 sm:pr-8",
                i >= 2 && "border-t lg:border-t-0",
                // Desktop: one row.
                "lg:px-[clamp(1.5rem,3.5vw,3.5rem)] lg:first:pl-0",
                i > 0 && "lg:border-l",
              )}
            >
              <Reveal delay={i * 0.08} className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                <Icon
                  name={stat.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length]}
                  className="size-10 shrink-0 text-burgundy lg:size-11"
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="font-display text-[clamp(2.25rem,4.2vw,3.875rem)] font-medium leading-[0.9] text-foreground">
                    {stat.value}
                  </p>
                  <p className="type-caps mt-1 text-foreground">{stat.title}</p>
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
