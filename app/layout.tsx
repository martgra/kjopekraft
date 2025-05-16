// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileMetaScript from "@/components/ui/MobileMetaScript";
import Footer from "@/components/ui/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kjøpekraft",
  description: "Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  // Add Open Graph metadata for social sharing
  openGraph: {
    type: 'website',
    locale: 'nb_NO',
    url: 'https://kjopekraft.no',
    title: 'Kjøpekraft',
    description: 'Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge.',
    siteName: 'Kjøpekraft',
    // Make image optional until we create it
    ...(process.env.NODE_ENV === 'production' ? {
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Kjøpekraft - Sjekk kjøpekraften din!',
        }
      ]
    } : {})
  },
  // Add Twitter card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Kjøpekraft',
    description: 'Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge.',
    ...(process.env.NODE_ENV === 'production' ? { images: ['/og-image.jpg'] } : {})
  },
  // Add robots directives for better indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    }
  },
  // Add canonical URL
  alternates: {
    canonical: 'https://kjopekraft.no',
  },
  // Add keywords (less important nowadays but still used)
  keywords: ['kjøpekraft', 'lønn', 'lønnsforhandling','økonomi', 'personlig økonomi', 'Norge', 'beregning']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        {/* JSON-LD structured data for better search understanding */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://kjopekraft.no",
              "name": "Kjøpekraft",
              "description": "Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge."
            })
          }}
        />
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased text-base
          bg-white        /* white background */
          h-full   /* at least viewport height */
          flex flex-col
        `}
      >
        <MobileMetaScript />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}