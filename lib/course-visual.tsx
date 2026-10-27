/**
 * The visual identity for a course cover.
 *
 * A cover is either a real image (course.image is set) or one of these. The
 * generated path exists so the catalogue never shows an empty box — but it is
 * designed to look deliberate rather than placeholder, because for a K150–K700
 * course the cover is the single biggest factor in whether anybody clicks.
 *
 * Two rules shape the design:
 *
 *   1. Colour is chosen by CATEGORY, not by hashing the slug. Eight categories
 *      get eight identities, so a student browsing the grid learns to read the
 *      catalogue at a glance — "the gold-navy ones are AI".
 *   2. AI-generated artwork carries NO text. Every image model garbles rendered
 *      type, so any text on a cover is drawn by this component, on top of
 *      whatever image is underneath.
 */

export type CategoryStyle = {
  /** Base background. Always from the brand's dark end. */
  bg: string;
  /** Accent used for glows, rules and the category label. */
  accent: string;
  /** Secondary tone for the large background glyph. */
  tone: string;
  /** Short label rendered on the cover. */
  label: string;
  glyph: Glyph;
};

export type Glyph =
  | "chip"
  | "megaphone"
  | "browser"
  | "pen"
  | "book"
  | "play"
  | "briefcase"
  | "laptop";

/**
 * Keyed by the exact category name in the database. Names come from
 * db/seed.ts — if a category is renamed there, rename it here.
 */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "AI & Automation": {
    bg: "#0b111d",
    accent: "#f1911d",
    tone: "#1a2438",
    label: "AI & Automation",
    glyph: "chip",
  },
  "Digital Marketing & Ads": {
    bg: "#13181f",
    accent: "#f1911d",
    tone: "#22303f",
    label: "Marketing & Ads",
    glyph: "megaphone",
  },
  "Web Design & WordPress": {
    bg: "#0f131e",
    accent: "#e0a05a",
    tone: "#1d2a3a",
    label: "Web Design",
    glyph: "browser",
  },
  "Graphic Design & Canva": {
    bg: "#1d130b",
    accent: "#f1911d",
    tone: "#33241a",
    label: "Design & Canva",
    glyph: "pen",
  },
  "Courses & Ebooks": {
    bg: "#212127",
    accent: "#c9c3bd",
    tone: "#2e2e35",
    label: "Courses & Ebooks",
    glyph: "book",
  },
  "Content Creation": {
    bg: "#282222",
    accent: "#f1911d",
    tone: "#3a3030",
    label: "Content Creation",
    glyph: "play",
  },
  "Freelancing & Clients": {
    bg: "#0d1219",
    accent: "#a66a2f",
    tone: "#1b2531",
    label: "Freelancing",
    glyph: "briefcase",
  },
  "Computer & Digital Literacy": {
    bg: "#13181f",
    accent: "#9a9696",
    tone: "#20262e",
    label: "Digital Literacy",
    glyph: "laptop",
  },
};

/** Used when a course has no category — neutral, so it never looks broken. */
export const FALLBACK_STYLE: CategoryStyle = {
  bg: "#0b111d",
  accent: "#f1911d",
  tone: "#1a2438",
  label: "Course",
  glyph: "book",
};

export function styleForCategory(category: string | null | undefined): CategoryStyle {
  if (!category) return FALLBACK_STYLE;
  return CATEGORY_STYLES[category] ?? FALLBACK_STYLE;
}

/** A large, faint category mark. Decorative — always aria-hidden by the caller. */
export function CategoryGlyph({
  glyph,
  color,
  className = "",
}: {
  glyph: Glyph;
  color: string;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (glyph) {
    case "chip":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M10 3v2M14 3v2M10 19v2M14 19v2M3 10h2M3 14h2M19 10h2M19 14h2" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M14 8a4 4 0 0 1 0 8M17 6a7 7 0 0 1 0 12" />
        </svg>
      );
    case "browser":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 8h18M6.5 6h.01M9.5 6h.01" />
          <path d="M7 12h6M7 15h9" />
        </svg>
      );
    case "pen":
      return (
        <svg {...common}>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          <path d="M14.5 5.5 18.5 9.5" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
          <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M10 9.5v5l4.5-2.5Z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
        </svg>
      );
    case "laptop":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <path d="M2 19h20" />
        </svg>
      );
  }
}
