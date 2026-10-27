import type { MetadataRoute } from "next";

import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

/**
 * Makes the site installable and gives the browser the theme colour. Dark
 * chrome, because the whole site is dark — a white browser bar on the learning
 * page would be a visible seam.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — George J. Kasonso`,
    short_name: "$100 Guy Courses",
    description: `${SITE_TAGLINE} ${SITE_NAME} — practical digital-skills courses from Lusaka, Zambia.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b111d",
    theme_color: "#0b111d",
    lang: "en-ZM",
    categories: ["education", "business"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
