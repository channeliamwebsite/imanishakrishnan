import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "text" | "inverse";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-burgundy text-white hover:bg-foreground",
  outline: "border border-foreground/80 text-foreground hover:bg-foreground hover:text-background",
  /** Bare label, e.g. the "WATCH VIDEO" play link. */
  ghost: "text-muted hover:text-burgundy",
  inverse: "border border-white/70 text-white hover:bg-white hover:text-foreground",
  /** Inline arrow link, e.g. "READ MORE →". */
  text: "text-burgundy hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-12 px-6",
  md: "h-14 px-7",
};

type ButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  /** Trailing arrow (default for primary/text) or leading play icon. */
  icon?: "arrow" | "play" | "none";
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "children">;

export function Button({
  href,
  variant = "primary",
  size = "md",
  icon = variant === "primary" || variant === "text" ? "arrow" : "none",
  className,
  children,
  ...props
}: ButtonProps) {
  const isBoxed = variant !== "text" && variant !== "ghost";
  return (
    <Link
      href={href}
      className={cn(
        "type-button group inline-flex items-center gap-3 transition-colors duration-300 ease-editorial",
        isBoxed && sizes[size],
        isBoxed && "justify-center",
        variant === "ghost" && "gap-4 text-[0.6875rem]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon === "play" && (
        <span className="grid size-14 place-items-center rounded-full border border-rose/50 text-foreground transition-colors group-hover:border-burgundy">
          <Play className="size-3 translate-x-px fill-current" aria-hidden />
        </span>
      )}
      <span>{children}</span>
      {icon === "arrow" && (
        <ArrowRight
          className="size-3.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
          aria-hidden
        />
      )}
    </Link>
  );
}
