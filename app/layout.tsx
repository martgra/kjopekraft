// app/layout.tsx

import type { Metadata } from 'next'
import MobileMetaScript from '@/components/ui/common/MobileMetaScript'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import { DisplayModeProvider } from '@/contexts/displayMode/DisplayModeContext'
import './globals.css'

// System font stacks (fallback when Google Fonts unavailable)
const fontVariables = `
  --font-geist-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-geist-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  --font-manrope: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

export const metadata: Metadata = {
  title: 'Kjøpekraft',
  description: 'Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
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
    ...(process.env.NODE_ENV === 'production'
      ? {
          images: [
            {
              url: '/og-image.png',
              width: 1200,
              height: 630,
              alt: 'Kjøpekraft - Sjekk kjøpekraften din!',
            },
          ],
        }
      : {}),
  },
  // Add Twitter card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Kjøpekraft',
    description: 'Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge.',
    ...(process.env.NODE_ENV === 'production' ? { images: ['/og-image.jpg'] } : {}),
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
    },
  },
  // Add canonical URL
  alternates: {
    canonical: 'https://kjopekraft.no',
  },
  // Add keywords (less important nowadays but still used)
  keywords: [
    'kjøpekraft',
    'lønn',
    'lønnsforhandling',
    'økonomi',
    'personlig økonomi',
    'Norge',
    'beregning',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nb" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        {/* Material Symbols Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD structured data for better search understanding */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://kjopekraft.no',
              name: 'Kjøpekraft',
              description: 'Sjekk kjøpekraften din! Beregn og sammenlign din kjøpekraft i Norge.',
            }),
          }}
        />
      </head>
      <body className="h-full bg-[var(--background-light)] font-sans text-base antialiased">
        <style dangerouslySetInnerHTML={{ __html: `:root { ${fontVariables} }` }} />
        <MobileMetaScript />
        <DisplayModeProvider>
          {children}
          <MobileBottomNav />
        </DisplayModeProvider>
      </body>
    </html>
  )
}
