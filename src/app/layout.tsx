import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holy Matrimony",
  description: "India's Trusted Christian Matrimony",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}