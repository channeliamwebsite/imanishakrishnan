import sanitizeHtml from "sanitize-html";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";

/**
 * Sanitises an article body (HTML from the admin's rich-text editor) before it is rendered:
 * only the editor's formats survive, links are limited to safe schemes and images to this
 * site's Cloudinary account. Used by the public article page and the admin preview alike.
 */
export function sanitizeArticleHtml(html: string | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "hr", "img"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === "img" && !isCloudinaryUrl(frame.attribs.src ?? ""),
    transformTags: {
      // External links open safely; internal links stay in the tab.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external: Record<string, string> = { href, target: "_blank", rel: "noopener noreferrer" };
        return { tagName, attribs: /^https?:\/\//i.test(href) ? external : { href } };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
    },
  });
}
