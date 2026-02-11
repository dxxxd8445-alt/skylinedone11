import React from "react"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { I18nProvider } from "@/lib/i18n-context";
import { Toaster } from "@/components/ui/toaster";
import { I18nDocument } from "@/components/i18n-document";
import { TawkToChat } from "@/components/tawk-to-chat";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { TermsPopup } from "@/components/terms-popup";
import { WelcomePopup } from "@/components/welcome-popup";
import { LiveSalesNotifications } from "@/components/live-sales-notifications";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ContentProtection } from "@/components/content-protection";
import { AffiliateTracker } from "@/components/affiliate-tracker";
import "@/lib/ssr-polyfills";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SKYLINE CHEATS Undetected Hacks and Cheats for Games!",
  description:
    "Skyline Cheats offers elite, regularly updated undetected game enhancements trusted by 300,000+ customers and backed by 4,000+ 5-star reviews. Instant delivery, secure checkout, and 24/7 support. Gain the competitive edge with Skyline Cheats.",
  generator: 'v0.app',
  openGraph: {
    title: "SKYLINE CHEATS Undetected Hacks and Cheats for Games!",
    description: "Skyline Cheats offers elite, regularly updated undetected game enhancements trusted by 300,000+ customers and backed by 4,000+ 5-star reviews. Instant delivery, secure checkout, and 24/7 support. Gain the competitive edge with Skyline Cheats.",
    url: "https://skylinecheats.org",
    siteName: "Skyline Cheats",
    type: "website",
    images: [
      {
        url: "https://skylinecheats.org/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Skyline Cheats - Undetected Game Enhancements",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKYLINE CHEATS Undetected Hacks and Cheats for Games!",
    description: "Skyline Cheats offers elite, regularly updated undetected game enhancements trusted by 300,000+ customers and backed by 4,000+ 5-star reviews. Instant delivery, secure checkout, and 24/7 support. Gain the competitive edge with Skyline Cheats.",
    images: ["https://skylinecheats.org/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <I18nProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <ContentProtection />
                <I18nDocument />
                <AnnouncementBanner />
                <AnalyticsProvider />
                <Suspense fallback={null}>
                  <AffiliateTracker />
                </Suspense>
                {children}
                <Toaster />
                <TawkToChat />
                <TermsPopup />
                <WelcomePopup />
                <LiveSalesNotifications />
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </I18nProvider>
        <Analytics />
        
        {/* Clicky Web Analytics */}
        <Script
          id="clicky-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `var clicky_site_ids = clicky_site_ids || []; clicky_site_ids.push(101500977);`,
          }}
        />
        <Script
          src="//static.getclicky.com/js"
          strategy="afterInteractive"
          data-id="101500977"
        />
        <noscript>
          <p>
            <img alt="Clicky" width="1" height="1" src="//in.getclicky.com/101500977ns.gif" />
          </p>
        </noscript>
      </body>
    </html>
  );
}
