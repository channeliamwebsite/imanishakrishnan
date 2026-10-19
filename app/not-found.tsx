import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** 404 for unknown addresses — in the site's colours and type, with a way back. */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center bg-background">
      <div className="container-site py-24">
        <p className="type-label text-rose">404</p>
        <h1 className="type-h1 mt-4 text-foreground">Page not found</h1>
        <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
        <p className="type-lead mt-6 max-w-[36rem] text-foreground/85">The page you are looking for does not exist or has moved.</p>
        <Link
          href="/"
          className="type-button mt-8 inline-flex h-12 items-center border border-burgundy px-7 text-burgundy transition-colors hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}
