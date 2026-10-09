import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"article"> & {
  variant?: "plain" | "bordered" | "surface";
};

const variants = {
  plain: "",
  bordered: "border hairline",
  surface: "bg-surface border hairline shadow-[0_1px_3px_rgba(28,26,26,0.04)]",
};

/** Base card: consistent structure, border and hover behaviour for work & insight cards. */
export function Card({ variant = "surface", className, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col transition-[border-color,box-shadow] duration-300 ease-editorial hover:shadow-[0_8px_24px_rgba(28,26,26,0.06)]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Card content area; the last child (usually the CTA) is pushed to the bottom. */
export function CardBody({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-1 flex-col gap-2.5 p-card-pad [&>*:last-child]:mt-auto", className)}
      {...props}
    />
  );
}
