"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAdminAuth } from "./AdminAuth";
import { AdminButton, Notice, Spinner, TextInput } from "./ui";

/** Sidebar navigation. Routes live in app/admin/*. */
const NAV: { heading: string; links: { href: string; label: string }[] }[] = [
  { heading: "Overview", links: [{ href: "/admin", label: "Dashboard" }] },
  {
    heading: "Homepage",
    links: [
      { href: "/admin/homepage", label: "Hero" },
      { href: "/admin/statistics", label: "Statistics" },
      { href: "/admin/about", label: "About page" },
      { href: "/admin/timeline", label: "Timeline" },
      { href: "/admin/work", label: "Work & detail pages" },
      { href: "/admin/awards", label: "Awards" },
      { href: "/admin/media", label: "Media mentions" },
      { href: "/admin/philosophy", label: "Philosophy" },
      { href: "/admin/insights", label: "Insights section" },
    ],
  },
  {
    heading: "Pages",
    links: [
      { href: "/admin/press", label: "Media & Press" },
      { href: "/admin/videos", label: "Video Gallery" },
      { href: "/admin/ecosystem", label: "Ecosystem Enabler & events" },
      { href: "/admin/avatar", label: "Avatar Video" },
      { href: "/admin/editorial-insights", label: "Editorial Insights" },
      { href: "/admin/ecosystem-builder", label: "Ecosystem section (About)" },
    ],
  },
  {
    heading: "More content",
    links: [
      { href: "/admin/events", label: "Events (legacy)" },
      { href: "/admin/testimonials", label: "Testimonials" },
    ],
  },
  {
    heading: "Blog",
    links: [
      { href: "/admin/blogs", label: "Articles" },
      { href: "/admin/blogs/create", label: "New article" },
    ],
  },
  {
    heading: "Site",
    links: [
      { href: "/admin/media-library", label: "Media library" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/blogs") return pathname === "/admin/blogs" || pathname.startsWith("/admin/blogs/edit");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function FullPage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">{children}</div>;
}

function LoginScreen() {
  const { signIn, resetPassword } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInfo(null);
    setError(await signIn(email, password));
    setBusy(false);
  }

  async function onReset() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setError(null);
    await resetPassword(email);
    setInfo("If an admin account exists for that address, a password reset email is on its way.");
  }

  return (
    <FullPage>
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 rounded-lg border border-border bg-white p-6 shadow-sm">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-rose">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Sign in</h1>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice tone="success">{info}</Notice>}
        <TextInput label="Email" type="email" autoComplete="username" required value={email} onChange={setEmail} />
        <TextInput
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={setPassword}
        />
        <AdminButton type="submit" variant="primary" loading={busy} className="w-full">
          Sign in
        </AdminButton>
        <button type="button" onClick={onReset} className="w-full font-sans text-sm text-muted underline-offset-4 hover:underline">
          Forgot password?
        </button>
      </form>
    </FullPage>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { status, message, identity, signOut } = useAdminAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading" || status === "checking") {
    return (
      <FullPage>
        <Spinner label={status === "checking" ? "Checking access…" : "Loading…"} />
      </FullPage>
    );
  }
  if (status === "unconfigured") {
    return (
      <FullPage>
        <Notice tone="error" title="Firebase is not configured">
          Set the NEXT_PUBLIC_FIREBASE_* environment variables to use the admin.
        </Notice>
      </FullPage>
    );
  }
  if (status === "signed-out") return <LoginScreen />;
  if (status === "denied") {
    return (
      <FullPage>
        <div className="w-full max-w-sm space-y-4">
          <Notice tone="error" title="No admin access">
            {message ?? "This account is not an administrator."}
          </Notice>
          <AdminButton onClick={signOut} className="w-full">
            Sign out
          </AdminButton>
        </div>
      </FullPage>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar: fixed on desktop, slide-over on mobile. */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/admin" className="font-display text-xl font-semibold text-foreground" onClick={() => setMenuOpen(false)}>
            Site admin
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => (
            <div key={group.heading} className="mb-5">
              <p className="px-2 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-subtle">{group.heading}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-[0.9375rem] text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
                        isActive(pathname, link.href) && "bg-burgundy/8 font-semibold text-burgundy",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-4">
          <p className="truncate text-sm text-muted" title={identity}>
            {identity}
          </p>
          <div className="flex gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold hover:border-foreground/40"
            >
              View site <ExternalLink className="size-3.5" aria-hidden />
            </a>
            <AdminButton size="sm" variant="ghost" onClick={signOut}>
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </AdminButton>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-border bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="font-display text-lg font-semibold">Site admin</span>
        </div>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

/** Page title row used by every admin page. */
export function AdminPageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[0.9375rem] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
