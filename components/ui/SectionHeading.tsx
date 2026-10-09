import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionLabel } from "./SectionLabel";

type SectionHeadingProps = {
  label?: ReactNode;
  title: ReactNode;
  /** Supporting copy. "below" stacks under the title; "inline" sits beside it on desktop. */
  intro?: ReactNode;
  introPlacement?: "below" | "inline";
  /** Short burgundy rule under the title (About) or a rose rule after it (Media). */
  rule?: "below" | "after";
  /** Right-aligned actions: links, carousel arrows. */
  aside?: ReactNode;
  as?: "h1" | "h2" | "h3";
  tone?: "default" | "inverse";
  className?: string;
};

/** Eyebrow + uppercase display heading, with optional intro and actions. Owns the heading → content gap. */
export function SectionHeading({
  label,
  title,
  intro,
  introPlacement = "below",
  rule,
  aside,
  as: Tag = "h2",
  tone = "default",
  className,
}: SectionHeadingProps) {
  const inverse = tone === "inverse";
  const introNode = intro && (
    <p
      className={cn(
        "type-small max-w-[29rem]",
        inverse ? "text-white/70" : "text-muted",
      )}
    >
      {intro}
    </p>
  );

  return (
    <header
      className={cn(
        "stack-heading flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">
        {label && <SectionLabel tone={inverse ? "inverse" : "accent"}>{label}</SectionLabel>}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
          <Tag
            className={cn(
              "type-h2",
              // Keep the title on one line when copy sits beside it.
              (introPlacement === "inline" || rule === "after") && "lg:shrink-0",
              inverse ? "text-white" : "text-foreground",
            )}
          >
            {title}
          </Tag>
          {rule === "after" && <span aria-hidden className="hidden h-px w-14 bg-rose/60 lg:block" />}
          {introPlacement === "inline" && introNode}
        </div>
        {rule === "below" && <span aria-hidden className="mt-4 block h-0.5 w-14 bg-burgundy" />}
        {introPlacement === "below" && introNode}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-6">{aside}</div>}
    </header>
  );
}
