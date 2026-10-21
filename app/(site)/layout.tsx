import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings, getSocialLinks } from "@/lib/content";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { ClickEvents } from "@/components/analytics/ClickEvents";

/** Public website chrome. The admin (app/admin) has its own layout and never renders this. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()]);

  return (
    <>
      <Navbar siteName={settings.siteName} links={settings.navigation} cta={settings.connectCta} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} socialLinks={socialLinks} />
      {/* Google Tag Manager — public pages only, loaded once for the whole site layout. */}
      <GoogleTagManager />
      <ClickEvents />
    </>
  );
}
