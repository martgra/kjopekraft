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
  // you can leave this here or remove it; links below are the source of truth
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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-base`}
      >
        <MobileMetaScript />
        {children}
      </body>
    </html>
  );
}
