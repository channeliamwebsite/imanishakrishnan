import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import type { SiteSettings, SocialLink } from "@/types/content";
import { SECTION_IDS } from "@/lib/sections";
import { SocialIcon } from "@/components/ui/SocialIcon";

type FooterProps = {
  settings: SiteSettings;
  socialLinks: SocialLink[];
};

export function Footer({ settings, socialLinks }: FooterProps) {
  const { footer, siteName, roles, navigation } = settings;

  return (
    <footer id={SECTION_IDS.contact} className="bg-burgundy-deep text-white">
      <div className="container-site pt-[clamp(2.75rem,4vw,3.25rem)]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] lg:grid-cols-[2.1fr_1fr_1.3fr] lg:gap-grid">
          {/* Identity */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <p className="font-display text-[1.75rem] font-medium uppercase leading-none tracking-[0.06em]">
              {siteName}
            </p>
            <p className="type-small flex flex-wrap items-center gap-x-3 text-[0.9375rem] text-white/60">
              {roles.map((role, i) => (
                <Fragment key={role}>
                  {i > 0 && <span aria-hidden>·</span>}
                  <span>{role}</span>
                </Fragment>
              ))}
            </p>
            <p className="type-body mt-3 max-w-[23rem] text-white/80">{footer.description}</p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <p className="type-caps mb-4 text-[0.75rem] text-white/75">{footer.quickLinksTitle}</p>
            <ul className="grid grid-cols-2 gap-x-8 xs:grid-cols-3 md:grid-cols-1">
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-small leading-[1.6] text-white/85 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div>
            <p className="type-caps mb-4 text-[0.75rem] text-white/75">{footer.connectTitle}</p>
            <p className="type-small mb-6 max-w-[21rem] text-white/75">{footer.connectText}</p>

            {/* Visual shell — submission is wired up with the contact backend later. */}
            <form className="flex max-w-[24rem]" action="#">
              <label htmlFor="footer-email" className="sr-only">
                {footer.newsletterPlaceholder}
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder={footer.newsletterPlaceholder}
                className="type-small h-11 min-w-0 flex-1 bg-white px-4 text-[0.9375rem] text-foreground placeholder:text-subtle focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-11 w-14 place-items-center border border-white/80 text-white transition-colors hover:bg-white hover:text-burgundy-deep"
              >
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </form>

            <ul className="mt-6 flex items-center gap-9">
              {socialLinks.map((social) => {
                const external = !social.url.startsWith("mailto:");
                return (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                      aria-label={social.label}
                      className="block text-white/90 transition-colors hover:text-white"
                    >
                      <SocialIcon platform={social.platform} className="size-6" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,4vw,3.25rem)] flex flex-col gap-3 border-t border-white/20 py-5 md:flex-row md:items-center md:justify-between">
          <p className="type-small text-[0.875rem] text-white/70">{footer.copyright}</p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {footer.legalLinks.map((link, i) => (
              <li key={link.href} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden className="text-white/40">
                    |
                  </span>
                )}
                <Link href={link.href} className="type-small text-[0.875rem] text-white/70 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
