import "./globals.css";

import type {
  Metadata,
} from "next";

import Script from "next/script";

import AppChrome from "@/components/layout/AppChrome";

import Providers from "@/components/providers/Providers";

const SITE_URL =
  "https://www.theholymatrimony.com";

export const metadata: Metadata = {
  metadataBase:
    new URL(
      SITE_URL
    ),

  title: {
    default:
      "Holy Matrimony | Christian Matrimony in India",

    template:
      "%s | Holy Matrimony",
  },

  description:
    "Holy Matrimony is a trusted Christian matrimony platform helping Christian singles and families in India discover meaningful, faith-centered marriage matches.",

  applicationName:
    "Holy Matrimony",

  keywords: [
    "Christian matrimony",
    "Christian matrimonial",
    "Christian marriage",
    "Christian brides",
    "Christian grooms",
    "Christian matrimony India",
    "Christian matrimonial site India",
    "Christian marriage matches",
    "Christian singles India",
    "Holy Matrimony",
  ],

  authors: [
    {
      name:
        "Holy Matrimony",
    },
  ],

  creator:
    "Holy Matrimony",

  publisher:
    "Holy Matrimony",

  category:
    "Matrimony",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-video-preview":
        -1,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,
    },
  },

  openGraph: {
    type:
      "website",

    locale:
      "en_IN",

    siteName:
      "Holy Matrimony",

    title:
      "Holy Matrimony | Christian Matrimony in India",

    description:
      "Discover meaningful Christian marriage matches through a faith-focused matrimony platform built for Christian singles and families in India.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Holy Matrimony | Christian Matrimony in India",

    description:
      "Discover meaningful Christian marriage matches through Holy Matrimony.",
  },

  icons: {
    icon: [
      {
        url:
          "/icon.png",

        type:
          "image/png",
      },
    ],

    apple: [
      {
        url:
          "/apple-icon.png",

        type:
          "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className="min-h-screen bg-white text-slate-900">
        <Providers>
          <AppChrome>
            {children}
          </AppChrome>
        </Providers>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
