import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

/** Centered max-width wrapper with the site gutter. */
export function Container<T extends ElementType = "div">({ as, className, ...props }: ContainerProps<T>) {
  const Tag = as ?? "div";
  return <Tag className={cn("container-site", className)} {...props} />;
}

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  /** Surface tone. */
  tone?: "default" | "surface" | "dark" | "burgundy";
  /** Disable the standard vertical padding (e.g. for full-bleed sections). */
  flush?: boolean;
};

const tones = {
  default: "bg-background text-foreground",
  surface: "bg-surface text-foreground",
  dark: "bg-dark-section text-white",
  burgundy: "bg-burgundy-deep text-white",
};

/** Page section with the standard vertical rhythm. */
export function Section({ tone = "default", flush, className, ...props }: SectionProps) {
  return <section className={cn(tones[tone], !flush && "section-y", className)} {...props} />;
}
