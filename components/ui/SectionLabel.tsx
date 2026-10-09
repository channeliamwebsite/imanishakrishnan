import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionLabelProps = {
  children: ReactNode;
  tone?: "accent" | "muted" | "inverse";
  className?: string;
};

const tones = {
  accent: "text-rose",
  muted: "text-subtle",
  inverse: "text-white/70",
};

/** Small uppercase eyebrow, e.g. "ABOUT NISHA", "INITIATIVES". */
export function SectionLabel({ children, tone = "accent", className }: SectionLabelProps) {
  return <p className={cn("type-label", tones[tone], className)}>{children}</p>;
}
