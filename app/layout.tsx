import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart-provider";
import { JsonLd } from "@/components/json-ld";
import {
  IDS,
  INSTITUTION,
  OWNER,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
  organizationNode,
  personNode,
  websiteNode,
} from "@/lib/seo";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const DESCRIPTION =
  "Practical digital-skills courses from George J. Kasonso — AI, freelancing, marketing, design and web design. Learn a skill, use it, get paid. Lusaka, Zambia.";

/**
 * Every absolute URL in metadata, sitemaps and structured data is built from
 * this one value, so moving to a new domain cannot leave a stale host baked
 * into the tags.
 */
const BASE = SITE_URL;

export const viewport: Viewport = {
  themeColor: "#0b111d",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE),

  // The template means a page that only sets `title` still inherits the brand.
  title: {
    default: `${SITE_NAME} — George J. Kasonso | Digital Skills Courses in Zambia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,

  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  keywords: [
    "digital skills courses Zambia",
    "digital skills Lusaka",
    "AI courses Zambia",
    "graphic design course Lusaka",
    "web design course Zambia",
    "freelancing course Zambia",
    "copywriting course Zambia",
    "Facebook ads course Zambia",
    "social media management course Zambia",
    "Canva graphic design Zambia",
    "WordPress course Zambia",
    "computer literacy Lusaka",
    "make money online Zambia",
    "first $100 online",
    "George Kasonso",
    "The $100 Guy",
    "Enterprise College",
    "online courses Zambia",
    "digital marketing course Zambia",
  ],

  authors: [{ name: OWNER.name, url: OWNER.url }],
  creator: OWNER.name,
  publisher: SITE_NAME,
  category: "Education",
  formatDetection: { telephone: false },

  alternates: {
    canonical: "/",
    languages: {
      "en-ZM": "/",
      "x-default": "/",
    },
  },

  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    alternateLocale: ["en_US", "en_GB"],
    url: BASE,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — George J. Kasonso`,
    description: DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Learn2Earn — practical digital-skills courses from George J. Kasonso, Lusaka, Zambia.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — George J. Kasonso`,
    description: DESCRIPTION,
    images: ["/twitter-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },

  manifest: "/manifest.webmanifest",

  other: {
    "geo.region": "ZM-LU",
    "geo.placename": "Lusaka",
    "geo.position": "-15.387526;28.322817",
    ICBM: "-15.387526, 28.322817",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZM">
      <body className={outfit.className}>
        {/*
          The identity graph is identical on every page. Page-specific nodes
          (Course, BreadcrumbList, FAQPage) are emitted by the page itself, so
          the graph merges into one entity set instead of fragmenting.
        */}
        <JsonLd
          nodes={[
            websiteNode(),
            organizationNode(),
            personNode(),
            {
              "@type": "EducationalOrganization",
              "@id": IDS.institution,
              name: INSTITUTION.name,
              url: INSTITUTION.url,
              slogan: INSTITUTION.accent,
              address: OWNER.address,
              sameAs: OWNER.sameAs,
            },
          ]}
        />
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
