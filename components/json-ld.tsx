import { jsonLd } from "@/lib/seo";

/**
 * Emits a JSON-LD graph.
 *
 * Must be rendered as a plain <script> with the type attribute — Next's <Script>
 * component injects differently and Google will not read it. Stringifying here
 * rather than in the caller keeps every graph consistent and makes accidental
 * single-quote breakage impossible.
 */
export function JsonLd({ nodes }: { nodes: unknown[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(nodes) }}
    />
  );
}
