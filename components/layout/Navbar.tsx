"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Link as NavLink } from "@/types/content";
import { cn } from "@/lib/cn";

type NavbarProps = {
  siteName: string;
  /** From siteSettings.navigation — adding a section (e.g. Speaking) never requires editing this component. */
  links: NavLink[];
  cta: NavLink;
};

export function Navbar({ siteName, links, cta }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md transition-[border-color] duration-300",
          scrolled ? "hairline" : "border-transparent",
        )}
      >
        <nav className="container-site flex h-nav items-center justify-between gap-6" aria-label="Primary">
          <Link
            href="/"
            className="shrink-0 font-display text-[1.375rem] font-medium uppercase leading-none tracking-[0.04em] text-foreground sm:text-[1.5rem] xl:text-[1.75rem]"
          >
            {siteName}
          </Link>

          {/* 1024–1279: links only (tight); ≥1280: reference spacing + CONNECT button. */}
          <ul className="hidden items-center gap-5 lg:flex xl:ml-8 xl:mr-auto xl:gap-10">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="type-nav relative py-2 text-foreground/85 transition-colors hover:text-burgundy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-burgundy after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={cta.href}
            className="type-button group hidden h-12 shrink-0 items-center gap-3 bg-burgundy px-6 text-white transition-colors duration-300 hover:bg-foreground xl:inline-flex"
          >
            {cta.label}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative -mr-2 grid size-11 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className={cn(
                "absolute h-px w-6 bg-foreground transition-transform duration-300",
                open ? "rotate-45" : "-translate-y-[5px]",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-6 bg-foreground transition-transform duration-300",
                open ? "-rotate-45" : "translate-y-[5px]",
              )}
            />
          </button>
        </nav>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap this fixed panel. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-nav bottom-0 z-40 overflow-y-auto bg-background lg:hidden"
          >
            <ul className="container-site flex flex-col pt-4">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4 }}
                  className="border-b hairline"
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 font-display text-[1.875rem] font-medium uppercase leading-tight text-foreground"
                  >
                    {link.label}
                    <ArrowRight className="size-4 text-burgundy" aria-hidden />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container-site py-8">
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="type-button flex h-14 items-center justify-center gap-3 bg-burgundy text-white"
              >
                {cta.label}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
