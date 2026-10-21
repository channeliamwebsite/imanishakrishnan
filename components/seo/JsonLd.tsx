/** "<" as a JSON unicode escape (backslash + u003c), so content can never close the script tag. */
const LT_ESCAPE = String.fromCharCode(92) + "u003c";

/** Renders one schema.org JSON-LD block (nothing for null). */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, LT_ESCAPE) }} />;
}
