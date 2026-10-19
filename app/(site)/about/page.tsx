import type { Metadata } from "next";
import { getAbout, getEcosystemEvents, getEcosystemPage, getTimeline } from "@/lib/content";
import { profile as fallbackProfile } from "@/lib/content/profile";
import { ProfileView } from "@/components/about/ProfileView";

const fallbackPage = fallbackProfile.page!;

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  const page = about.profile?.page ?? fallbackPage;
  return { title: "About", description: page.metaDescription || undefined };
}

/**
 * The full profile (from about/main → profile, falling back to the approved workbook content).
 * Long-form material that would overcrowd the homepage: detailed bio, all 12 milestones with
 * descriptions, the 12 achievements, the 11 areas of expertise and the leadership philosophy.
 */
export default async function AboutPage() {
  const [about, timeline, ecosystemPage, ecosystemEvents] = await Promise.all([
    getAbout(),
    getTimeline(),
    getEcosystemPage(),
    getEcosystemEvents(),
  ]);
  const profile = about.profile ?? fallbackProfile;
  return (
    <ProfileView
      profile={profile}
      page={profile.page ?? fallbackPage}
      timeline={timeline}
      ecosystem={{ about: ecosystemPage.about, events: ecosystemEvents }}
    />
  );
}
