import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'
import { AppThemeProvider, ColorThemeScript } from "@/components/theme-provider"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axonelix",
  description: "Med-Edu platform for Medical Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider appearance={{
      theme: shadcn
    }}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <ColorThemeScript />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AppThemeProvider>
            {children}
            <SonnerToaster />
          </AppThemeProvider>
          <Script
            id="register-sw"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                 if ('serviceWorker' in navigator) {
                   window.addEventListener('load', function() {
                     navigator.serviceWorker.register('/sw.js');
                   });
                 }
               `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
