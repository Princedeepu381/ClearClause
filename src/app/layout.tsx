import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

/**
 * Google Fonts: Inter typeface loaded via Next.js font optimization.
 * Uses Google's CDN with automatic subsetting and layout shift prevention.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * SEO metadata for the CLEARCLAUSE platform.
 * Includes Open Graph tags for social sharing.
 */
export const metadata: Metadata = {
  title: "CLEARCLAUSE | AI Contract Intelligence — Powered by Google Gemini",
  description:
    "AI-powered contract analysis platform that detects hidden liabilities, exploitative clauses, and one-sided obligations in legal agreements. Built on Google Gemini 3.6 Flash and deployed via Google Cloud Run.",
  keywords: [
    "contract analysis",
    "legal AI",
    "risk detection",
    "Google Gemini",
    "contract intelligence",
    "legal technology",
  ],
  authors: [{ name: "CLEARCLAUSE Team" }],
  openGraph: {
    title: "CLEARCLAUSE | AI Contract Intelligence",
    description:
      "Detect hidden liabilities and exploitative clauses in legal documents instantly with Google Gemini AI.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Root layout component providing the HTML shell,
 * dark theme enforcement, and Google Fonts integration.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased dark`}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        {children}
        <GoogleAnalytics gaId="G-CLEARCLAUSE01" />
      </body>
    </html>
  );
}
