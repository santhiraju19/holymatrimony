import type {
  MetadataRoute,
} from "next";

const SITE_URL =
  "https://www.theholymatrimony.com";

export default function robots():
MetadataRoute.Robots {
  return {
    rules: {
      userAgent:
        "*",

      allow: [
        "/",
        "/contact",
        "/membership",
        "/success-stories",
      ],

      disallow: [
        "/admin",
        "/admin/",

        "/dashboard",
        "/dashboard/",

        "/chat",
        "/notifications",

        "/profile",
        "/profile/",

        "/search",

        "/settings",

        "/shortlists",

        "/received-interests",
        "/sent-interests",

        "/saved-searches",

        "/who-viewed-me",

        "/verification",

        "/login",
        "/register",

        "/forgot-password",
        "/reactivate-account",
        "/verify-email",

        "/membership/checkout",
      ],
    },

    sitemap:
      `${SITE_URL}/sitemap.xml`,

    host:
      SITE_URL,
  };
}
