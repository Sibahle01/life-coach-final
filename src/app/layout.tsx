// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutContent from "@/components/layout/LayoutContent";

// Font configuration - Only Inter font
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap', // Better font loading
});

export const metadata: Metadata = {
  title: "Pastor Sifiso Nkabinde | Spiritual Leadership Coach",
  description: "Biblical coaching for modern leaders seeking purpose, clarity, and spiritual fulfillment. Transform your life through faith.",
  keywords: ["spiritual coaching", "biblical wisdom", "leadership", "faith", "purpose", "pastor", "life coach", "ministry", "Johannesburg"],
  authors: [{ name: "Pastor Sifiso Nkabinde" }],
  openGraph: {
    type: 'website',
    title: 'Pastor Sifiso Nkabinde - Spiritual Leadership Coach',
    description: 'Transform your life through biblical wisdom and practical coaching.',
    siteName: 'Pastor Sifiso Nkabinde',
    locale: 'en_ZA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pastor Sifiso Nkabinde | Spiritual Leadership Coach',
    description: 'Biblical coaching for modern leaders seeking purpose and spiritual fulfillment.',
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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#131313" />
        
        {/* Preconnect to Google Fonts for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans bg-black text-white antialiased">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}