import type { Metadata, Viewport } from "next";
import { cormorant, crimson } from "./fonts";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings, getSocialLinks } from "@/lib/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    metadataBase: new URL(seo.siteUrl),
    title: { default: seo.title, template: seo.titleTemplate },
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      images: seo.ogImage?.url ? [{ url: seo.ogImage.url, alt: seo.ogImage.alt }] : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f8f6f2",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()]);

  return (
    <html lang="en" className={`${cormorant.variable} ${crimson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Without JavaScript, scroll reveals never run — show their content as-is. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <Navbar siteName={settings.siteName} links={settings.navigation} cta={settings.connectCta} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} socialLinks={socialLinks} />
      </body>
    </html>
  );
}
