import { Fragment } from "react";
import type { HeroContent } from "@/types/content";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/Image";

/** "I'm Nisha Krishnan" → greeting "I'm", lines ["Nisha", "Krishnan"]. Works without a greeting too. */
function splitName(name: string) {
  const match = name.match(/^(I['’]m)\s+(.+)$/i);
  const words = (match ? match[2] : name).trim().split(/\s+/);
  return {
    greeting: match?.[1],
    lines: words.length > 1 ? [words[0], words.slice(1).join(" ")] : words,
  };
}

/** "IDEAS | PEOPLE | IMPACT" → ["IDEAS", "PEOPLE", "IMPACT"]; "KOCHI / INDIA" → ["KOCHI", "INDIA"]. */
const splitOn = (value: string, separator: string) =>
  value.split(separator).map((part) => part.trim()).filter(Boolean);

/** Video links open in a new tab; with no URL yet the button keeps its in-page placeholder anchor. */
function secondaryLinkProps(url?: string) {
  if (!url) return { href: "#video" };
  return /^https?:\/\//.test(url) ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
}

/**
 * Reference composition (1440px): copy column ~45% inside the container,
 * portrait fills the remaining ~55% and bleeds to the right viewport edge.
 */
export function Hero({ content }: { content: HeroContent }) {
  const { eyebrow, name, designation, roles, description, primaryCta, secondaryCta, image, location } = content;
  const { greeting, lines } = splitName(name);
  const eyebrowWords = splitOn(eyebrow, "|");
  const roleLine = [designation, ...roles].filter(Boolean);
  const locationLines = splitOn(location, "/");
  // No uploaded image yet → keep the placeholder frame, labelled for screen readers.
  const portrait = image?.url ? image : { url: "", publicId: "", alt: image?.alt ?? `Portrait of ${lines.join(" ")}` };

  return (
    <section className="relative">
      <div className="container-site grid lg:min-h-[clamp(36rem,calc(100svh-var(--nav-height)),41rem)] lg:grid-cols-[45fr_55fr]">
        {/* Copy */}
        {/* Entrance: each element rises in sequence (CSS only — visible without JS, off for reduced motion). */}
        <div className="relative z-10 flex flex-col justify-center pb-12 pt-10 sm:pt-14 lg:py-12 lg:pr-8">
          {eyebrowWords.length > 0 && (
            <p className="animate-rise type-label mb-5 flex flex-wrap items-center gap-x-3 text-rose">
              {eyebrowWords.map((word, i) => (
                <Fragment key={i}>
                  {i > 0 && <span aria-hidden>|</span>}
                  <span>{word}</span>
                </Fragment>
              ))}
            </p>
          )}

          <h1 className="text-foreground">
            {greeting && (
              <span className="animate-rise mb-2 block font-display text-[clamp(1.5rem,2.1vw,1.875rem)] italic normal-case leading-none text-muted [animation-delay:80ms]">
                {greeting}
              </span>
            )}
            {lines.map((line, i) => (
              <span key={i} className="animate-rise type-display block [animation-delay:160ms]">
                {line}
              </span>
            ))}
          </h1>

          {/* Each separator travels with the role after it, so wrapped lines never end on a dot. */}
          <p className="animate-rise mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 font-serif text-[clamp(1.125rem,1.7vw,1.5rem)] text-foreground/80 [animation-delay:260ms]">
            {roleLine.map((role, i) => (
              <span key={i} className="flex items-center gap-x-5 whitespace-nowrap">
                {i > 0 && (
                  <span aria-hidden className="text-foreground/50">
                    ·
                  </span>
                )}
                {role}
              </span>
            ))}
          </p>

          <span aria-hidden className="animate-rise mt-7 block h-0.5 w-16 bg-burgundy [animation-delay:320ms]" />

          <p className="animate-rise type-lead mt-7 max-w-[31rem] text-foreground/85 [animation-delay:360ms]">{description}</p>

          <div className="animate-rise mt-9 flex flex-wrap items-center gap-x-10 gap-y-5 [animation-delay:460ms]">
            <Button href={primaryCta.link}>{primaryCta.label}</Button>
            {secondaryCta && (
              <Button {...secondaryLinkProps(secondaryCta.url)} variant="ghost" icon="play">
                {secondaryCta.label}
              </Button>
            )}
          </div>
        </div>

        {/*
          Portrait. The column is the frame: it reserves the space (no layout shift) and clips the photo;
          on desktop it fills the right column and bleeds to the viewport edge.

          The source is a tall portrait (≈0.555:1; hair from ~10% of its height, hands to ~80%).
          Sizing it from the frame's WIDTH (object-cover across the column) zooms in further the wider
          the screen — at 1920px only the face fits. So from 640px up the photo is sized from the
          frame's HEIGHT instead: drawn at 140% of it, shifted up 10% and anchored to the right edge,
          which shows head to hands (~7%–79% of the photo) at the same scale on every desktop width.
          Mobile keeps its full-width 4:5 frame, anchored near the top so the head stays in view.
        */}
        <div className="animate-rise-slow relative -mx-gutter overflow-hidden [animation-delay:200ms] sm:aspect-[4/3] lg:mx-0 lg:aspect-auto lg:bleed-right">
          {/*
            Placement: centred in the stacked tablet frame (photo width = 58% of the 4:3 frame).
            Desktop: anchored from the column's LEFT, measured against the column's content width
            (excluding the viewport bleed), so she sits close to the text at every desktop width.
          */}
          <div className="relative aspect-[4/5] sm:absolute sm:right-[21%] sm:top-[-10%] sm:h-[140%] sm:aspect-[555/1000] lg:right-auto lg:left-[calc((100%-var(--bleed))*0.02)] xl:left-[calc((100%-var(--bleed))*0.12)]">
            {/*
              Desktop backdrop: a very soft warm-beige glow (existing --border tone) with a faint rose
              warmth, sitting behind the photo. It shows where the photo's edges dissolve, so the
              portrait reads as part of the page rather than a separate rectangle.
            */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-[42%] bottom-[22%] top-[6%] hidden bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--rose)_7%,transparent),transparent_70%),radial-gradient(closest-side,color-mix(in_oklab,var(--border)_85%,transparent),transparent)] lg:block"
            />
            <MediaImage
              media={portrait}
              ratio={null}
              preload
              sizes="(min-width: 1024px) 45vw, (min-width: 640px) 70vw, 100vw"
              // ≥640px: the photo's left/right edges fade to transparent (not painted over), so its
              // own light backdrop dissolves into the page and the glow behind it.
              className="h-full w-full sm:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_90%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_90%,transparent)]"
              imageClassName="object-[70%_15%] sm:object-center"
            />
          </div>
          {/* Soft top edge (≥640px), above the hair line, so the photo's backdrop has no hard line */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-5 bg-gradient-to-b from-background to-transparent sm:block"
          />
          {/* Soft fade where the portrait meets the next section */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent sm:h-[12%]"
          />
          {locationLines.length > 0 && (
            <div className="absolute right-[7%] top-[12%] text-right sm:text-left">
              <p className="type-label leading-[1.8] tracking-[0.22em] text-foreground/75">
                {locationLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <span aria-hidden className="mt-4 block h-px w-14 bg-rose/60" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
