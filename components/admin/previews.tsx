"use client";

import { useEffect, useState, type ReactNode } from "react";
import type {
  AboutContent,
  HeroContent,
  ImpactStatistic,
  MediaFeature,
  PhilosophyContent,
  SiteSettings,
  SocialLink,
  Testimonial,
  TimelineEntry,
  WorkItem,
} from "@/types/content";
import { selectActiveStatistics } from "@/lib/content/normalize";
import { profile as builtInProfile } from "@/lib/content/profile";
import { SECTIONS, type SectionKey } from "@/lib/cms/sections";
import { readPublished } from "@/lib/cms/store";
import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { AboutSection } from "@/components/home/AboutSection";
import { WorkSection } from "@/components/home/WorkSection";
import { MediaSection } from "@/components/home/MediaSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { InsightsSection } from "@/components/home/InsightsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { siteSettings as builtInSettings } from "@/lib/content/placeholder";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileView } from "@/components/about/ProfileView";
import { ArticleView } from "@/components/insights/ArticleView";
import { sanitizeArticleHtml } from "@/lib/content/html";
import type { Insight } from "@/types/content";
import { Notice, Spinner } from "./ui";

/**
 * Previews render the real public components — never copies of them — with the edited draft,
 * after the same validation the live site applies. Sections the edit doesn't touch are shown
 * as they are live (or built-in, if never published).
 */

/** The live content of another section, validated, for preview context. */
function useLive<T>(key: SectionKey): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    let active = true;
    const def = SECTIONS[key];
    readPublished(def)
      .catch(() => null)
      .then((published) => {
        const checked = def.validate(published ?? def.builtIn());
        if (active) setValue((checked.ok ? checked.value : def.builtIn()) as T);
      });
    return () => {
      active = false;
    };
  }, [key]);
  return value;
}

const visible = <T extends { published?: boolean }>(items: T[]) => items.filter((item) => item.published !== false);

/** Validates the draft; shows the problems instead of a broken preview. */
function Checked<T>({ section, data, children }: { section: SectionKey; data: unknown; children: (value: T) => ReactNode }) {
  const checked = SECTIONS[section].validate(data);
  if (!checked.ok) {
    return (
      <div className="p-4">
        <Notice tone="warning" title="Preview unavailable">
          Fix the highlighted problems first ({checked.issues.length} found).
        </Notice>
      </div>
    );
  }
  return <>{children(checked.value as T)}</>;
}

export function HeroPreview({ data }: { data: unknown }) {
  return <Checked<HeroContent> section="hero" data={data}>{(hero) => <Hero content={hero} />}</Checked>;
}

export function StatisticsPreview({ data }: { data: unknown }) {
  return (
    <Checked<ImpactStatistic[]> section="statistics" data={data}>
      {(items) => <ImpactStats items={selectActiveStatistics(items)} />}
    </Checked>
  );
}

export function AboutPreview({ data }: { data: unknown }) {
  const timeline = useLive<TimelineEntry[]>("timeline");
  if (!timeline) return <Spinner />;
  return (
    <Checked<AboutContent> section="about" data={data}>
      {(about) => (
        <>
          <AboutSection content={about} timeline={visible(timeline)} />
          <div className="border-t-4 border-dashed border-border" />
          <ProfileView
            profile={about.profile ?? builtInProfile}
            page={about.profile?.page ?? builtInProfile.page!}
            timeline={visible(timeline)}
          />
        </>
      )}
    </Checked>
  );
}

/** Awards live in about/main → profile.achievements; preview the /about page. */
export function ProfilePreview({ data }: { data: unknown }) {
  const timeline = useLive<TimelineEntry[]>("timeline");
  if (!timeline) return <Spinner />;
  return (
    <Checked<AboutContent> section="about" data={data}>
      {(about) => (
        <ProfileView
          profile={about.profile ?? builtInProfile}
          page={about.profile?.page ?? builtInProfile.page!}
          timeline={visible(timeline)}
        />
      )}
    </Checked>
  );
}

export function TimelinePreview({ data }: { data: unknown }) {
  const about = useLive<AboutContent>("about");
  if (!about) return <Spinner />;
  return (
    <Checked<TimelineEntry[]> section="timeline" data={data}>
      {(timeline) => <AboutSection content={about} timeline={visible(timeline)} />}
    </Checked>
  );
}

export function WorkPreview({ data }: { data: unknown }) {
  const settings = useLive<SiteSettings>("siteSettings");
  if (!settings) return <Spinner />;
  return (
    <Checked<WorkItem[]> section="work" data={data}>
      {(items) => <WorkSection items={visible(items)} copy={settings.sections.work} />}
    </Checked>
  );
}

export function MediaPreview({ data }: { data: unknown }) {
  const settings = useLive<SiteSettings>("siteSettings");
  if (!settings) return <Spinner />;
  return (
    <Checked<MediaFeature[]> section="mediaFeatures" data={data}>
      {(items) => <MediaSection items={visible(items)} copy={settings.sections.media} />}
    </Checked>
  );
}

export function PhilosophyPreview({ data }: { data: unknown }) {
  return (
    <Checked<PhilosophyContent> section="philosophy" data={data}>
      {(content) => <PhilosophySection content={content} />}
    </Checked>
  );
}

const testimonialsCopy = (settings: SiteSettings) => settings.sections.testimonials ?? builtInSettings.sections.testimonials!;

export function TestimonialsPreview({ data }: { data: unknown }) {
  const settings = useLive<SiteSettings>("siteSettings");
  if (!settings) return <Spinner />;
  return (
    <Checked<Testimonial[]> section="testimonials" data={data}>
      {(items) =>
        visible(items).length > 0 ? (
          <TestimonialsSection items={visible(items)} copy={testimonialsCopy(settings)} />
        ) : (
          <div className="p-4">
            <Notice tone="info">No visible testimonials — the section is hidden on the website.</Notice>
          </div>
        )
      }
    </Checked>
  );
}

/** Settings drive the header, footer and section headings — preview the ones edited on each page. */
export function SettingsPreview({
  data,
  part,
}: {
  data: unknown;
  part: "chrome" | "work" | "media" | "insights" | "testimonials";
}) {
  const work = useLive<WorkItem[]>("work");
  const media = useLive<MediaFeature[]>("mediaFeatures");
  const social = useLive<SocialLink[]>("socialLinks");
  const testimonials = useLive<Testimonial[]>("testimonials");
  if (!work || !media || !social || !testimonials) return <Spinner />;
  return (
    <Checked<SiteSettings> section="siteSettings" data={data}>
      {(settings) => {
        switch (part) {
          case "work":
            return <WorkSection items={visible(work)} copy={settings.sections.work} />;
          case "media":
            return <MediaSection items={visible(media)} copy={settings.sections.media} />;
          case "insights":
            return <InsightsSection items={[]} copy={settings.sections.insights} />;
          case "testimonials":
            return <TestimonialsSection items={visible(testimonials)} copy={testimonialsCopy(settings)} />;
          default:
            return (
              <>
                <Navbar siteName={settings.siteName} links={settings.navigation} cta={settings.connectCta} />
                <div className="py-16 text-center font-sans text-muted">…page content…</div>
                <Footer settings={settings} socialLinks={visible(social)} />
              </>
            );
        }
      }}
    </Checked>
  );
}

export function SocialPreview({ data }: { data: unknown }) {
  const settings = useLive<SiteSettings>("siteSettings");
  if (!settings) return <Spinner />;
  return (
    <Checked<SocialLink[]> section="socialLinks" data={data}>
      {(links) => <Footer settings={settings} socialLinks={visible(links)} />}
    </Checked>
  );
}

/** Article draft → the public article page. */
export function ArticlePreview({ data }: { data: unknown }) {
  const article = data as Insight;
  const preview: Insight = { ...article, published: true, order: 0, publishedAt: article.publishedAt || new Date().toISOString() };
  return <ArticleView article={preview} html={sanitizeArticleHtml(article.body)} />;
}

export type PreviewKind =
  | "hero"
  | "statistics"
  | "about"
  | "profile"
  | "timeline"
  | "work"
  | "media"
  | "philosophy"
  | "testimonials"
  | "settings-chrome"
  | "settings-work"
  | "settings-media"
  | "settings-insights"
  | "settings-testimonials"
  | "social"
  | "article";

/** Rendered inside the preview iframe (app/preview). */
export function PreviewRenderer({ kind, data }: { kind: PreviewKind; data: unknown }) {
  switch (kind) {
    case "hero":
      return <HeroPreview data={data} />;
    case "statistics":
      return <StatisticsPreview data={data} />;
    case "about":
      return <AboutPreview data={data} />;
    case "profile":
      return <ProfilePreview data={data} />;
    case "timeline":
      return <TimelinePreview data={data} />;
    case "work":
      return <WorkPreview data={data} />;
    case "media":
      return <MediaPreview data={data} />;
    case "philosophy":
      return <PhilosophyPreview data={data} />;
    case "testimonials":
      return <TestimonialsPreview data={data} />;
    case "settings-chrome":
      return <SettingsPreview data={data} part="chrome" />;
    case "settings-work":
      return <SettingsPreview data={data} part="work" />;
    case "settings-media":
      return <SettingsPreview data={data} part="media" />;
    case "settings-insights":
      return <SettingsPreview data={data} part="insights" />;
    case "settings-testimonials":
      return <SettingsPreview data={data} part="testimonials" />;
    case "social":
      return <SocialPreview data={data} />;
    case "article":
      return <ArticlePreview data={data} />;
  }
}
