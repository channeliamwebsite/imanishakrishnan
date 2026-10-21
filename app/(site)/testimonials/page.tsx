import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { siteSettings as fallbackSettings } from "@/lib/content/placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialGallery } from "@/components/testimonials/TestimonialGallery";
import { breadcrumbLd, getSiteUrl, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

async function getCopy() {
  const { sections } = await getSiteSettings();
  return sections.testimonials ?? fallbackSettings.sections.testimonials!;
}

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getCopy();
  return pageMetadata({ title: copy.heading, description: copy.intro, path: "/testimonials" });
}

/** Every testimonial image (siteSettings → sections.testimonials.images), in the admin's order. */
export default async function TestimonialsPage() {
  const copy = await getCopy();
  const images = (copy.images ?? []).filter((m) => isCloudinaryUrl(m.url));
  return (
    <>
      <JsonLd data={breadcrumbLd(await getSiteUrl(), [{ name: copy.heading, path: "/testimonials" }])} />
      <section className="section-y pb-0">
        <div className="container-site">
          <Reveal>
            {copy.label && <p className="type-label text-rose">{copy.label}</p>}
            <h1 className="type-h1 mt-4 text-foreground">{copy.heading}</h1>
            <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
            {copy.intro && <p className="type-lead mt-6 max-w-[48rem] text-foreground/85">{copy.intro}</p>}
          </Reveal>
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          <TestimonialGallery images={images} />
        </div>
      </section>
    </>
  );
}
