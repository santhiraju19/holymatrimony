import "./globals.css";

import type {
  Metadata,
} from "next";

import Script from "next/script";

import AppChrome from "@/components/layout/AppChrome";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "Holy Matrimony",
    template:
      "%s | Holy Matrimony",
  },

  description:
    "India's trusted privacy-first Christian matrimony platform.",

  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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