/**
 * Checks that the built-in content (lib/content/placeholder.ts) passes the same validation the
 * admin applies before publishing. The admin starts every section from this content, so it must
 * be publishable as-is.   npm run validate:content
 */
import { parseHero, parseStatistic } from "@/lib/content/normalize";
import {
  aboutSchema,
  describeIssue,
  mediaFeatureSchema,
  philosophySchema,
  siteSettingsSchema,
  socialLinkSchema,
  timelineItemSchema,
  workItemSchema,
} from "@/lib/content/schemas";
import * as content from "@/lib/content/placeholder";
import type { z } from "zod";

const problems: string[] = [];
const check = (label: string, schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  if (!result.success) problems.push(`${label}: ${describeIssue(result.error)}`);
};

const hero = parseHero(content.hero, { primaryCta: content.hero.primaryCta });
if (!hero.value) problems.push(`hero: ${hero.error}`);
for (const s of content.statistics) {
  const parsed = parseStatistic(s.id ?? "?", s);
  if (!parsed.value) problems.push(`statistics/${s.id}: ${parsed.error}`);
}
check("about", aboutSchema, content.about);
check("philosophy", philosophySchema, content.philosophy);
check("siteSettings", siteSettingsSchema, content.siteSettings);
content.timeline.forEach((t) => check(`timeline/${t.id}`, timelineItemSchema, t));
content.work.forEach((w) => check(`work/${w.id}`, workItemSchema, w));
content.mediaFeatures.forEach((m) => check(`mediaFeatures/${m.id}`, mediaFeatureSchema, m));
content.socialLinks.forEach((l) => check(`socialLinks/${l.id}`, socialLinkSchema, l));

if (problems.length) {
  console.error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("All built-in content passes validation.");
}
