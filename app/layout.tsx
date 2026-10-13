import type { Metadata, Viewport } from "next";
import { cormorant, crimson } from "./fonts";
import { getSiteSettings } from "@/lib/content";
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

/** Document shell shared by the public site (app/(site)) and the admin (app/admin). */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${crimson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Without JavaScript, scroll reveals never run — show their content as-is. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
