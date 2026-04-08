import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'
import { AppThemeProvider, ColorThemeScript } from "@/components/theme-provider"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import IconDark from '@/public/images/Icon.png';
import IconLight from '@/public/images/Icon-light.png';

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
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: IconLight.src,
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: IconDark.src,
      },
    ],
  }
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
        </body>
      </html>
    </ClerkProvider>
  );
}
