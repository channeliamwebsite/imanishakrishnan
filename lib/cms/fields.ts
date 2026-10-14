import type { CloudinaryFolder } from "@/lib/cloudinary/folders";

/**
 * Declarative form definitions. Admin pages describe *which* fields a section has (lib/cms/pages.ts)
 * and components/admin/form renders them — no content is hardcoded in admin components.
 * `key` is the property name inside the parent object.
 */
type Base = { key: string; label: string; help?: string };

export type FieldDef =
  | (Base & { kind: "text"; required?: boolean; placeholder?: string })
  | (Base & { kind: "textarea"; required?: boolean; rows?: number })
  | (Base & { kind: "number" })
  | (Base & { kind: "date" })
  | (Base & { kind: "toggle" })
  | (Base & { kind: "select"; options: { value: string; label: string }[]; emptyLabel?: string })
  | (Base & {
      kind: "image";
      folder: CloudinaryFolder;
      /** Offer the optional crop (default true). */
      crop?: boolean;
      /** Show a caption input (stored on the image). */
      caption?: boolean;
    })
  | (Base & { kind: "images"; folder: CloudinaryFolder; crop?: boolean; caption?: boolean })
  | (Base & { kind: "link"; optional?: boolean })
  | (Base & { kind: "strings"; itemLabel: string; multiline?: boolean })
  | (Base & { kind: "group"; fields: FieldDef[] })
  | (Base & {
      kind: "list";
      fields: FieldDef[];
      itemLabel: string;
      /** One-line summary shown on the collapsed item. */
      summary: (item: Record<string, unknown>) => string;
      newItem: () => Record<string, unknown>;
      /** Boolean field that shows/hides the item on the site (adds a toggle to the item header). */
      visibleField?: string;
    });
