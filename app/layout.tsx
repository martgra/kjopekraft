// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileMetaScript from "@/components/ui/MobileMetaScript";
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
  description: "Sjekk kjøpekraften din!",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
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
        {children}
      </body>
    </html>
  );
}