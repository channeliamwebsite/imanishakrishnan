import type { AvatarVideo, HeroContent } from "@/types/content";
import { AvatarButton } from "./AvatarButton";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/Image";
import { withCloudinaryTransformation } from "@/lib/cloudinary/url";

/**
 * The hero photo is a studio shot on a flat #f7f7f7 backdrop. Cloudinary makes that backdrop
 * transparent at delivery (the stored asset and URL are unchanged), so the hero background
 * gradient shows behind the portrait. Update the colour if the photo is replaced.
 */
const PORTRAIT_BACKDROP_TO_TRANSPARENT = "e_make_transparent:10,co_rgb:f7f7f7";

/**
 * "I am Nisha Krishnan" → greeting "I am", lines ["Nisha", "Krishnan"]. Works without a greeting too.
 * The greeting is always set as "I am" — never "I'm" or all caps — whatever the stored spelling.
 */
function splitName(name: string) {
  const match = name.match(/^(I\s+am|I['’]m)\s+(.+)$/i);

  const words = (match ? match[2] : name).trim().split(/\s+/);

  return {
    greeting: match ? "I AM" : undefined,
    lines: words.length > 1 ? [words[0], words.slice(1).join(" ")] : words,
  };
}

/** "IDEAS | PEOPLE | IMPACT" → ["IDEAS", "PEOPLE", "IMPACT"]; "KOCHI / INDIA" → ["KOCHI", "INDIA"]. */
const splitOn = (value: string, separator: string) =>
  value.split(separator).map((part) => part.trim()).filter(Boolean);

/** External video links open in a new tab. */
function secondaryLinkProps(url: string) {
  return /^https?:\/\//.test(url) ? { href: url, target: "_blank", rel: "noopener noreferrer" } : { href: url };
}

/**
 * Reference composition (1440px): copy column ~45% inside the container,
 * portrait fills the remaining ~55% and bleeds to the right viewport edge.
 */
export function Hero({ content, avatar }: { content: HeroContent; avatar?: AvatarVideo | null }) {
  const { eyebrow, name, designation, roles, identity, tagline, description, primaryCta, secondaryCta, image, location } = content;
  const { greeting, lines } = splitName(name);
  const eyebrowWords = splitOn(eyebrow, "|");
  const roleLine = [designation, ...roles].filter(Boolean);
  const locationLines = splitOn(location, "/");
  // No uploaded image yet → keep the placeholder frame, labelled for screen readers.
  const portrait = image?.url
    ? { ...image, url: withCloudinaryTransformation(image.url, PORTRAIT_BACKDROP_TO_TRANSPARENT) }
    : { url: "", publicId: "", alt: image?.alt ?? `Portrait of ${lines.join(" ")}` };

  return (
    <section className="relative overflow-x-clip">
      {/* overflow-x-clip: the portrait bleed uses 100vw, which includes a classic scrollbar — clip that sliver. */}
      <div className="container-site grid lg:min-h-[clamp(36rem,calc(100svh-var(--nav-height)),41rem)] lg:grid-cols-[45fr_55fr]">
        {/* Copy */}
        {/* Entrance: each element rises in sequence (CSS only — visible without JS, off for reduced motion). */}
        <div className="relative z-10 flex flex-col justify-center pb-12 pt-10 sm:pt-14 lg:py-12 lg:pr-8">
          {/* The keyword eyebrow repeats the professional identity line — shown only without one. */}
          {!identity && eyebrowWords.length > 0 && (
            // Separators live in each item's left padding; the row is shifted left by that padding and
            // clips overflow, so the separator of whichever item starts a line is hidden — a wrapped
            // line never starts or ends with "|".
            <div className="animate-rise mb-5 overflow-hidden">
              <p className="type-label -ml-6 flex flex-wrap items-center text-rose">
                {eyebrowWords.map((word, i) => (
                  <span
                    key={i}
                    className="relative whitespace-nowrap pl-6 before:absolute before:left-[0.55rem] before:content-['|']"
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>
          )}

          <h1 className="text-foreground">
            {greeting && (
              <span className="animate-rise mb-2 block font-display text-[clamp(1.5rem,2vw,1.875rem)] font-medium leading-none text-muted [animation-delay:80ms]">
                {greeting}
              </span>
            )}
            {lines.map((line, i) => (
              <span key={i} className="animate-rise type-display block [animation-delay:160ms]">
                {line}
              </span>
            ))}
          </h1>

          {/* 2 · Professional identity — the CMS line; without one, the designation and roles. */}
          {identity ? (
            <p className="animate-rise mt-5 font-sans text-[clamp(0.8125rem,1vw,0.9375rem)] font-semibold uppercase tracking-[0.08em] text-foreground/85 [animation-delay:260ms]">
              {identity}
            </p>
          ) : (
            // Same clipped-separator technique as the eyebrow: no line starts or ends with "·".
            <div className="animate-rise mt-5 overflow-hidden [animation-delay:260ms]">
              <p className="-ml-6 flex flex-wrap items-center gap-y-2 font-sans text-[clamp(0.875rem,1.05vw,1rem)] font-semibold uppercase tracking-[0.08em] text-foreground/85">
                {roleLine.map((role, i) => (
                  <span
                    key={i}
                    className="relative whitespace-nowrap pl-6 before:absolute before:left-[0.6rem] before:text-foreground/50 before:content-['·']"
                  >
                    {role}
                  </span>
                ))}
              </p>
            </div>
          )}

          <span aria-hidden className="animate-rise mt-6 block h-0.5 w-16 bg-burgundy [animation-delay:320ms]" />

          {/* 3 · Brand tagline — serif italic, between the identity and the introduction. */}
          {tagline && (
            <p className="animate-rise mt-6 max-w-[30rem] font-display text-[clamp(1.375rem,1.9vw,1.75rem)] font-medium italic leading-snug text-burgundy [animation-delay:340ms]">
              {tagline}
            </p>
          )}

          {/* 4 · Introduction */}
          <p
            className={`animate-rise type-body max-w-[31rem] text-foreground/80 [animation-delay:380ms] ${tagline ? "mt-4" : "mt-6"}`}
          >
            {description}
          </p>

          <div className="animate-rise mt-8 flex flex-wrap items-center gap-x-10 gap-y-5 [animation-delay:460ms]">
            <Button href={primaryCta.link}>{primaryCta.label}</Button>
            {/* CMS: Avatar Video — only when enabled with a video URL. */}
            {avatar && <AvatarButton avatar={avatar} />}
            {/* Only with a real video URL — no placeholder link. */}
            {secondaryCta?.url && (
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
          frame's HEIGHT instead: drawn at 140% of it and shifted up 10%, which shows head to hands
          (~7%–79% of the photo) at the same scale on every desktop width.
          Mobile keeps its full-width 4:5 frame, anchored near the top so the head stays in view.
          The photo's flat backdrop is made transparent at delivery (see PORTRAIT_BACKDROP_TO_TRANSPARENT),
          so the layered .hero-backdrop gradient fills the whole area behind and around her.
        */}
        <div className="animate-rise-slow relative -mx-gutter overflow-hidden [animation-delay:200ms] sm:aspect-[4/3] lg:mx-0 lg:aspect-auto lg:bleed-right">
          {/*
            Placement: centred in the stacked tablet frame (photo width = 58% of the 4:3 frame).
            Desktop: anchored from the column's LEFT, measured against the column's content width
            (excluding the viewport bleed), so she sits close to the text at every desktop width.
          */}
          {/* Layered editorial backdrop filling the whole portrait area (app/globals.css → .hero-backdrop) */}
          <span aria-hidden className="hero-backdrop pointer-events-none absolute inset-0" />
          <div className="relative aspect-[4/5] sm:absolute sm:right-[21%] sm:top-[-10%] sm:h-[140%] sm:aspect-[555/1000] lg:right-auto lg:left-[calc((100%-var(--bleed))*0.02)] xl:left-[calc((100%-var(--bleed))*0.12)]">
            <MediaImage
              media={portrait}
              ratio={null}
              preload
              sizes="(min-width: 1024px) 45vw, (min-width: 640px) 70vw, 100vw"
              className="h-full w-full"
              imageClassName="object-[70%_15%] sm:object-center"
            />
          </div>
          {/* Soft fade where the portrait meets the next section */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/70 to-transparent sm:h-[16%]"
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
