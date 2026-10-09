import {
  Award,
  BarChart3,
  Building2,
  Globe2,
  Lightbulb,
  Mic,
  Newspaper,
  Sparkles,
  TrendingUp,
  Users,
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
};

/** Resolves CMS icon keys (stored as strings in Firestore) to line icons. */
export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name] ?? Sparkles;
  return <Component strokeWidth={1.1} aria-hidden {...props} />;
}
