// File: /src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import LayoutContent from "@/components/layout/LayoutContent";

// REMOVED: Google Inter font import - now using system fonts
// This eliminates the network dependency during build

export const metadata: Metadata = {
  title: "Sfiso Zungu | Spiritual Life Coach",
  description: "Transform your life through faith and purpose with Sfiso Zungu. Book coaching sessions, attend workshops, and discover spiritual growth.",
  keywords: ["life coach", "spiritual guidance", "faith coaching", "personal development", "Sfiso Zungu", "mentoring", "South Africa"],
  authors: [{ name: "Sfiso Zungu" }],
  openGraph: {
    type: 'website',
    title: 'Sfiso Zungu - Spiritual Life Coach',
    description: 'Transform your life through faith and purpose with personalized coaching.',
    siteName: 'Sfiso Zungu Coaching',
    locale: 'en_ZA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfiso Zungu | Spiritual Life Coach',
    description: 'Faith-based coaching for purpose and spiritual fulfillment.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        
        {/* REMOVED: Google Fonts preconnects - no longer needed */}
      </head>
      <body className="font-sans antialiased">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}