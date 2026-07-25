import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";

const geistSans = GeistSans;

export const metadata: Metadata = {
  metadataBase: new URL("https://crewcircle.com.au"),
  alternates: {
    canonical: "https://crewcircle.com.au",
  },
  title: "CrewCircle | Practical AI Tools for Australian Small Business",
  description:
      "Practical AI tools built for Australian small business: TaxFlowAI for tax research, LocalMate for local biz automation, CrewRoster for rostering, plus three more helpers launching August 2026.",
  openGraph: {
    title: "CrewCircle | Practical AI Tools for Australian Small Business",
    description:
      "Practical AI tools built for Australian small business: TaxFlowAI for tax research, LocalMate for local biz automation, CrewRoster for rostering, plus three more helpers launching August 2026.",
    url: "https://crewcircle.com.au",
    siteName: "CrewCircle",
    images: [{
      url: "https://crewcircle.com.au/social/social-preview-1200x630.png",
      width: 1200,
      height: 630,
      alt: "CrewCircle - Practical AI Tools for Australian Small Business",
    }],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@crewcircle_ai",
    creator: "@prabhatranjann",
    title: "CrewCircle",
    description:
      "Practical AI tools built for Australian small business: TaxFlowAI for tax research, LocalMate for local biz automation, CrewRoster for rostering, plus three more helpers launching August 2026.",
    images: ["https://crewcircle.com.au/social/social-preview-1200x630.png"],
  },
  other: {
    "linkedin:owner": "linkedin.com/company/crew-circle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
        <body className="min-h-full flex flex-col">
          <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <LocalBusinessJsonLd />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
