/**
 * Structured data for the whole platform, in one place.
 *
 * Google reads JSON-LD to build rich results — a course can show its price,
 * rating and availability in the search listing, which is the difference
 * between being clicked and being scrolled past. This module holds the
 * identity every page shares, and the small helpers pages use to add their own
 * nodes.
 *
 * Two rules:
 *
 *   1. Entity @ids are stable and absolute, and every node references them by
 *      @id rather than repeating fields. That is what makes the graph link
 *      together — Google merges the Person described on the course page with
 *      the one on the home page into a single entity.
 *   2. Nothing here is invented. No ratings, no reviews, no accreditation the
 *      business does not hold. Structured data that overstates is a manual
 *      penalty, and it is also just false.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Learn2Earn";
export const SITE_TAGLINE = "Learn a skill. Use it. Get paid.";
export const SITE_LOCALE = "en_ZM";

export const OWNER = {
  name: "George J. Kasonso",
  /** Names a person might actually type into a search box. */
  alternateName: [
    "George Kasonso",
    "George Kasonso Jackson",
    "George Jackson Kasonso",
    "George J Kasonso",
    "George Jackson",
    "George On Income",
    "George, The $100 Guy",
    "The $100 Guy",
  ],
  jobTitle: "Digital Entrepreneur, Educator and Speaker",
  email: "kasonso44@gmail.com",
  telephone: "+260 979 982 819",
  url: "https://georgekasonso.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Chipwenupwenu Road, Makeni East, Behind Cosmopolitan Mall",
    addressLocality: "Lusaka",
    addressRegion: "Lusaka Province",
    addressCountry: "ZM",
  },
  sameAs: [
    "https://www.linkedin.com/in/george-kasonso-4a81312a3",
    "https://www.facebook.com/georgeonincome",
    "https://www.tiktok.com/@georgeonincome",
    "https://www.instagram.com/georgeonincome1",
    "https://x.com/georgeonincome",
    "https://www.youtube.com/@georgeonincome-m3m",
    "https://t.me/georgeonincome",
    "https://github.com/georgeonincome",
  ],
} as const;

/** The organisation that actually issues the certificates. */
export const INSTITUTION = {
  name: "Enterprise College",
  url: "https://enterprise-college.vercel.app",
  accreditation: "ATEZ",
  accent: "Training for Life",
} as const;

export const SOCIALS = OWNER.sameAs;

/** Every node shares these @ids, so the graph merges instead of fragmenting. */
export const IDS = {
  website: `${SITE_URL}/#website`,
  organization: `${SITE_URL}/#organization`,
  person: `${SITE_URL}/#person`,
  institution: `${SITE_URL}/#institution`,
} as const;

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": IDS.website,
    url: `${SITE_URL}/`,
    name: `${SITE_NAME} — George J. Kasonso`,
    alternateName: "George Kasonso Courses",
    description:
      "Practical digital-skills courses from George J. Kasonso — AI, freelancing, marketing, design and web design. Learn a skill, use it, get paid. Lusaka, Zambia.",
    inLanguage: "en-ZM",
    publisher: { "@id": IDS.organization },
  };
}

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": IDS.organization,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description:
      "Digital-skills courses taught by George J. Kasonso. Practical, priced in kwacha, built around doing rather than watching.",
    email: OWNER.email,
    telephone: OWNER.telephone,
    logo: `${SITE_URL}/icon.svg`,
    address: OWNER.address,
    sameAs: SOCIALS,
    founder: { "@id": IDS.person },
  };
}

export function personNode() {
  return {
    "@type": "Person",
    "@id": IDS.person,
    name: OWNER.name,
    alternateName: [...OWNER.alternateName],
    jobTitle: OWNER.jobTitle,
    url: OWNER.url,
    email: OWNER.email,
    telephone: OWNER.telephone,
    nationality: "Zambian",
    description:
      "George J. Kasonso — The $100 Guy — is a digital entrepreneur, educator and speaker from Lusaka, Zambia. He teaches the digital skills that are paying right now, and runs Enterprise College, an ATEZ-accredited ICT and digital skills institution.",
    worksFor: [
      { "@type": "Organization", name: INSTITUTION.name, url: INSTITUTION.url },
      { "@type": "Organization", name: "The $100 Guy", url: "https://georgekasonso.com" },
      {
        "@type": "Organization",
        name: "Makeni Tech Solutions",
        url: `${SITE_URL}/contact`,
      },
    ],
    address: OWNER.address,
    sameAs: SOCIALS,
  };
}

export function institutionNode() {
  return {
    "@type": "EducationalOrganization",
    "@id": IDS.institution,
    name: INSTITUTION.name,
    url: INSTITUTION.url,
    slogan: INSTITUTION.accent,
    address: OWNER.address,
    sameAs: SOCIALS,
  };
}

/** Breadcrumbs from a trail of [name, path] pairs, root first. */
export function breadcrumbNode(
  items: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqNode(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * A course as structured data. Only include rating fields when real students
 * have actually reviewed it — an invented aggregateRating is a penalty risk.
 */
export function courseNode(input: {
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category?: string | null;
  lessons?: number | null;
  durationMinutes?: number | null;
  ratingSum?: number | null;
  ratingCount?: number | null;
}) {
  const url = `${SITE_URL}/courses/${input.slug}`;

  const node: Record<string, unknown> = {
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.title,
    url,
    description: input.description,
    inLanguage: "en-ZM",
    provider: { "@id": IDS.organization },
    author: { "@id": IDS.person },
    publisher: { "@id": IDS.organization },
    ...(input.category ? { keywords: input.category } : {}),
    ...(input.lessons ? { hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" } } : {}),
    offers: {
      "@type": "Offer",
      category: "Paid",
      price: input.price.toFixed(2),
      priceCurrency: input.currency,
      availability: "https://schema.org/InStock",
      url,
      seller: { "@id": IDS.organization },
      ...(input.price === 0
        ? { description: "Free course." }
        : { description: `${input.price.toFixed(2)} ${input.currency}, once off.` }),
    },
  };

  if (input.durationMinutes) {
    node.timeRequired = `PT${input.durationMinutes}M`;
  }

  if (input.ratingCount && input.ratingCount > 0 && input.ratingSum != null) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (input.ratingSum / input.ratingCount).toFixed(1),
      reviewCount: input.ratingCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return node;
}

/** Serialise a graph for a <script type="application/ld+json"> tag. */
export function jsonLd(nodes: unknown[]) {
  const graph = nodes.filter(Boolean);
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

/**
 * Build the complete Open Graph object for a page.
 *
 * This exists because of a sharp edge in Next.js metadata: a page's
 * `openGraph` REPLACES the root layout's rather than merging with it. Setting
 * `openGraph: { title, description }` on a page silently drops the site-wide
 * locale, site name and default image. Building the whole object in one place
 * is the only way to be sure every page carries all of it.
 */
export function ogTags(input: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
}) {
  const url = input.path ? `${SITE_URL}${input.path}` : SITE_URL;

  return {
    type: input.type ?? "website",
    locale: SITE_LOCALE,
    alternateLocale: ["en_US", "en_GB"],
    url,
    siteName: SITE_NAME,
    title: input.title,
    description: input.description,
    images: [
      {
        url: input.image ?? "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${input.title} — ${SITE_NAME}, Lusaka, Zambia.`,
      },
    ],
  };
}

export function twitterTags(input: {
  title: string;
  description: string;
  image?: string;
}) {
  return {
    card: "summary_large_image" as const,
    title: input.title,
    description: input.description,
    images: [input.image ?? "/twitter-image.png"],
  };
}

/**
 * Complete metadata for a page: title, description, canonical, hreflang, Open
 * Graph, Twitter and the noindex flag for private routes.
 *
 * Pages should call this rather than hand-assembling a Metadata object, so the
 * site-wide fields cannot be dropped by accident.
 */
export function pageMeta(input: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  /** Set on routes that must never appear in search results. */
  noindex?: boolean;
}) {
  const canonical = input.path ?? "/";

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: {
        "en-ZM": canonical,
        "x-default": canonical,
      },
    },
    openGraph: ogTags({
      title: input.title,
      description: input.description,
      path: canonical,
      type: input.type,
      image: input.image,
    }),
    twitter: twitterTags({
      title: input.title,
      description: input.description,
      image: input.image,
    }),
    robots: input.noindex ? { index: false, follow: false } : undefined,
  };
}

/**
 * The catalogue as an ItemList. Used on the home page, where the courses are
 * the content rather than a search result for one of them.
 *
 * Only the summary is included here — each course gets its own full Course node
 * on its own page, and duplicating price and rating here would create two
 * places for that data to disagree.
 */
export function courseListNode(
  list: { slug: string; title: string }[],
) {
  return {
    "@type": "ItemList",
    name: `${SITE_NAME} — course catalogue`,
    numberOfItems: list.length,
    itemListElement: list.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${SITE_URL}/courses/${c.slug}`,
    })),
  };
}
