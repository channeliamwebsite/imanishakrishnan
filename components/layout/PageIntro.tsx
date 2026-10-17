import { Reveal } from "@/components/ui/Reveal";

/** Page header shared by the gallery pages — the same pattern as /testimonials and /awards. */
export function PageIntro({ label, title, intro }: { label?: string; title: string; intro?: string }) {
  return (
    <Reveal>
      {label && <p className="type-label text-rose">{label}</p>}
      <h1 className="type-h1 mt-4 text-foreground">{title}</h1>
      <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
      {intro && <p className="type-lead mt-6 max-w-[48rem] text-foreground/85">{intro}</p>}
    </Reveal>
  );
}
