"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import type { PressArticle, PressCategory } from "@/types/content";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { FilterBar, formatDate } from "@/components/video/VideoPlayer";

const CATEGORIES: { value: PressCategory; label: string }[] = [
  { value: "newspaper", label: "Newspaper" },
  { value: "magazine", label: "Magazine" },
  { value: "online", label: "Online" },
  { value: "interview", label: "Interviews" },
  { value: "feature", label: "Features" },
  { value: "other", label: "Others" },
];

/** Grid size before "Explore All Press Coverage". */
const INITIAL = 9;

const meta = (a: PressArticle) => [a.publication, formatDate(a.date)].filter(Boolean).join(" · ");
const altFor = (a: PressArticle, i = 0) => a.images[i]?.alt || `${a.publication} — ${a.headline}`;

/** Clipping viewer: every image of the article, its details and the original article link. */
function ArticleModal({ article, onClose }: { article: PressArticle; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = article.images[index];
  const count = article.images.length;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose, count]);

  return (
    <div role="dialog" aria-modal="true" aria-label={article.headline} className="fixed inset-0 z-50 overflow-y-auto bg-foreground/95 p-4 sm:p-8" onClick={onClose}>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-3 top-3 z-10 grid size-11 place-items-center text-white/85 hover:text-white focus-visible:outline-2 focus-visible:outline-white sm:right-6 sm:top-6"
      >
        <X className="size-6" aria-hidden />
      </button>
      <div className="mx-auto grid max-w-6xl gap-8 pt-10 lg:grid-cols-12 lg:items-start" onClick={(e) => e.stopPropagation()}>
        <div className="lg:col-span-8">
          <div className="relative flex min-h-[40vh] items-center justify-center">
            <NextImage
              src={image.url}
              alt={altFor(article, index)}
              width={image.width ?? 1200}
              height={image.height ?? 1500}
              sizes="(min-width: 1024px) 64vw, 100vw"
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
          </div>
          {count > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4 text-white">
              <button type="button" onClick={() => setIndex((index - 1 + count) % count)} aria-label="Previous image" className="grid size-11 place-items-center hover:text-white/70">
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <span className="type-meta">
                {index + 1} / {count}
              </span>
              <button type="button" onClick={() => setIndex((index + 1) % count)} aria-label="Next image" className="grid size-11 place-items-center hover:text-white/70">
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          )}
        </div>
        <div className="text-white lg:col-span-4">
          <p className="type-caps text-white/60">{meta(article)}</p>
          <h2 className="type-h3 mt-3">{article.headline}</h2>
          {article.description && <p className="type-body mt-4 text-white/80">{article.description}</p>}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="type-button mt-6 inline-flex h-12 items-center gap-3 border border-white/70 px-6 text-white transition-colors hover:bg-white hover:text-foreground"
            >
              Read the Original Article <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Clipping({ article, onOpen, sizes, className }: { article: PressArticle; onOpen: () => void; sizes: string; className?: string }) {
  const cover = article.images[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open: ${article.headline}`}
      className={cn("group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy", className)}
    >
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden border hairline bg-white/40 p-3">
        <NextImage
          src={cover.url}
          alt={altFor(article)}
          width={cover.width ?? 1200}
          height={cover.height ?? 1500}
          sizes={sizes}
          className="max-h-full w-auto max-w-full object-contain transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.02]"
        />
      </div>
      <p className="type-meta mt-4 text-rose">{meta(article)}</p>
      <p className="type-h4 mt-1.5 text-foreground transition-colors group-hover:text-burgundy">{article.headline}</p>
    </button>
  );
}

/** /media: featured clipping + other featured entries, category filters and the clipping grid. */
export function PressGallery({ articles }: { articles: PressArticle[] }) {
  const [open, setOpen] = useState<PressArticle | null>(null);
  const [category, setCategory] = useState<PressCategory | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setOpen(null), []);

  const featured = articles.filter((a) => a.featured);
  const lead = featured[0] ?? articles[0];
  const side = (featured.length > 1 ? featured.slice(1) : articles.filter((a) => a !== lead)).slice(0, 3);
  const filtered = useMemo(() => (category === "all" ? articles : articles.filter((a) => a.category === category)), [articles, category]);
  const shown = expanded ? filtered : filtered.slice(0, INITIAL);
  const available = CATEGORIES.filter((c) => articles.some((a) => a.category === c.value));

  if (!lead) return <p className="type-body text-muted">Press coverage will appear here once it is published.</p>;
  const leadCover = lead.images[0];

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        {/* Featured clipping */}
        <Reveal className={cn("grid items-start gap-8 md:grid-cols-2", side.length ? "lg:col-span-8" : "lg:col-span-12")}>
          <button
            type="button"
            onClick={() => setOpen(lead)}
            aria-label={`Open: ${lead.headline}`}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
          >
            <NextImage
              src={leadCover.url}
              alt={altFor(lead)}
              width={leadCover.width ?? 1200}
              height={leadCover.height ?? 1500}
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 46vw, 100vw"
              preload
              className="h-auto w-full border hairline object-contain transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.01]"
            />
          </button>
          <div>
            <p className="type-label text-rose">Featured</p>
            <p className="type-meta mt-3 text-muted">{meta(lead)}</p>
            <h2 className="type-h2 mt-3 text-foreground">{lead.headline}</h2>
            <span aria-hidden className="mt-5 block h-0.5 w-12 bg-burgundy" />
            {lead.description && <p className="type-body mt-5 text-foreground/85">{lead.description}</p>}
            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
              <button type="button" onClick={() => setOpen(lead)} className="type-button group inline-flex items-center gap-3 text-burgundy hover:text-foreground">
                View Clipping <ArrowRight className="size-3.5 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
              </button>
              {lead.url && (
                <a href={lead.url} target="_blank" rel="noopener noreferrer" className="type-button inline-flex items-center gap-2 text-muted hover:text-burgundy">
                  Original Article <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {/* Smaller featured entries */}
        {side.length > 0 && (
          <ul className="grid content-start gap-6 border-t hairline pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {side.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => setOpen(a)} className="group flex w-full gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy">
                  <span className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden border hairline bg-white/40">
                    <NextImage src={a.images[0].url} alt="" fill sizes="80px" className="object-cover object-top" />
                  </span>
                  <span>
                    <span className="type-meta block text-rose">{meta(a)}</span>
                    <span className="type-h4 mt-1 block text-foreground transition-colors group-hover:text-burgundy">{a.headline}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-section border-t hairline pt-12">
        {available.length > 1 && (
          <div className="mb-10">
            <FilterBar
              options={available}
              value={category}
              onChange={(v) => {
                setCategory(v);
                setExpanded(false);
              }}
              label="Filter press coverage by category"
            />
          </div>
        )}
        <ul className="grid gap-x-card gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <li key={a.id}>
              <Clipping article={a} onOpen={() => setOpen(a)} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" />
            </li>
          ))}
        </ul>
        {!expanded && filtered.length > INITIAL && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="type-button group inline-flex h-12 items-center gap-3 border border-burgundy bg-background px-7 text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            >
              Explore All Press Coverage
              <ArrowRight className="size-3.5 transition-transform duration-300 ease-editorial motion-safe:group-hover:translate-x-1" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {open && <ArticleModal article={open} onClose={close} />}
    </>
  );
}
