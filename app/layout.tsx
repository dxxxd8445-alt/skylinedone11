import React from "react"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { I18nProvider } from "@/lib/i18n-context";
import { Toaster } from "@/components/ui/toaster";
import { I18nDocument } from "@/components/i18n-document";
import "@/lib/ssr-polyfills";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Magma Cheats - Play Without Limits",
  description:
    "A Powerful, Instant Solution to Play Without Limits. Elite cheats and hacks for a variety of online PC games.",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <I18nProvider>
          <CurrencyProvider>
            <AuthProvider>
              <CartProvider>
                <I18nDocument />
                {children}
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </CurrencyProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
