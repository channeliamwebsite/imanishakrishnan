"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/** Small, consistent building blocks for the admin dashboard. */

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
};

export function AdminButton({
  variant = "secondary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-sans font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
        size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-[0.9375rem]",
        variant === "primary" && "bg-burgundy text-white hover:bg-foreground",
        variant === "secondary" && "border border-border bg-white text-foreground hover:border-foreground/40",
        variant === "danger" && "border border-red-200 bg-white text-red-700 hover:bg-red-50",
        variant === "ghost" && "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-10 font-sans text-muted">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

const NOTICE_ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof NOTICE_ICONS;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = NOTICE_ICONS[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-md border px-4 py-3 font-sans text-[0.9375rem]",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-900",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
        tone === "error" && "border-red-200 bg-red-50 text-red-900",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "draft" | "live" | "muted"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-semibold",
        tone === "neutral" && "bg-foreground/5 text-foreground/75",
        tone === "draft" && "bg-amber-100 text-amber-900",
        tone === "live" && "bg-emerald-100 text-emerald-900",
        tone === "muted" && "bg-foreground/5 text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ title, description, actions, children, className }: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-white", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="font-sans text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 font-sans text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

const control =
  "w-full rounded-md border border-border bg-white px-3 py-2 font-sans text-[0.9375rem] text-foreground placeholder:text-muted/70 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 aria-[invalid=true]:border-red-400";

export function FieldShell({
  label,
  help,
  error,
  required,
  children,
  id,
}: {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-sans text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-burgundy"> *</span>}
      </label>
      {children}
      {help && !error && <p className="font-sans text-xs text-muted">{help}</p>}
      {error && <p className="font-sans text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

type Common = { label: string; help?: string; error?: string; required?: boolean };

export function TextInput({
  label,
  help,
  error,
  required,
  value,
  onChange,
  ...props
}: Common & Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange"> & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={required}>
      <input
        id={id}
        className={control}
        value={value}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  help,
  error,
  required,
  value,
  onChange,
  rows = 4,
  ...props
}: Common & Omit<ComponentPropsWithoutRef<"textarea">, "value" | "onChange"> & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={required}>
      <textarea
        id={id}
        rows={rows}
        className={cn(control, "leading-relaxed")}
        value={value}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectInput({
  label,
  help,
  error,
  required,
  value,
  onChange,
  options,
}: Common & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={required}>
      <select id={id} className={control} value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 accent-burgundy"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label htmlFor={id} className="font-sans text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        {help && <span className="block text-xs text-muted">{help}</span>}
      </label>
    </div>
  );
}
