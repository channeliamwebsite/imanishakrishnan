import {
  Award,
  BarChart3,
  Building2,
  Globe2,
  Lightbulb,
  Megaphone,
  MessageSquare,
  Mic,
  Newspaper,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Video,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/types/content";

const icons: Record<IconName, React.ComponentType<LucideProps>> = {
  mic: Mic,
  building: Building2,
  globe: Globe2,
  users: Users,
  sparkles: Sparkles,
  newspaper: Newspaper,
  award: Award,
  trending: TrendingUp,
  chart: BarChart3,
  lightbulb: Lightbulb,
  megaphone: Megaphone,
  video: Video,
  message: MessageSquare,
  trophy: Trophy,
};

/** Resolves CMS icon keys (stored as strings in Firestore) to line icons. */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name] ?? Sparkles;
  return <Component strokeWidth={1.1} aria-hidden {...props} />;
}
