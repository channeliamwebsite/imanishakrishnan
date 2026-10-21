import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Arrow-only "view all" link for a section header — same circle as the carousel arrows
 * (CarouselNav), with a burgundy arrow that nudges right on hover. `label` is its accessible name.
 */
export function ViewAllArrow({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "group grid size-11 shrink-0 place-items-center rounded-full border border-rose/50 text-burgundy transition-colors duration-300 hover:border-burgundy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
        className,
      )}
    >
      <ArrowRight
        className="size-4 transition-transform duration-300 ease-editorial motion-safe:group-hover:translate-x-0.5"
        strokeWidth={1.5}
        aria-hidden
      />
    </Link>
  );
}
