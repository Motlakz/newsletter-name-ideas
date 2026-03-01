import type { Metadata } from "next"
import { Quicksand, Raleway } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner"
import { NewsletterProvider } from "@/context/NewsletterContext"
import { SecurityProvider } from "@/context/SecurityContext"
import { SecurityWarning } from "@/components/security/security-warning"
import { SecurityBlocker } from "@/components/security/security-blocker"
import TinyAdzBanner from "@/components/common/tiny-adz-banner"

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
})

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://newsletternameideas.com"),
  title: {
    default: "Newsletter Name Ideas - Free AI Newsletter Name Generator",
    template: "%s | Newsletter Name Ideas",
  },
  description:
    "Generate creative, engaging, and memorable newsletter names for your audience with our AI-powered newsletter name generator.",
  keywords: [
    "newsletter name generator",
    "newsletter name ideas",
    "AI newsletter name generator",
    "email newsletter names",
    "newsletter naming tool",
  ],
  authors: [{ name: "Newsletter Name Ideas" }],
  creator: "Newsletter Name Ideas",
  publisher: "Newsletter Name Ideas",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newsletternameideas.com",
    siteName: "Newsletter Name Ideas",
    title: "Newsletter Name Ideas - Free AI Newsletter Name Generator",
    description:
      "Find the perfect name for your newsletter with our AI-powered generator.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Newsletter Name Generator - AI Powered Tool",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Newsletter Name Ideas - Free AI Newsletter Name Generator",
    description:
      "Generate the perfect newsletter name in seconds with our AI tool.",
    images: ["/twitter-image.png"],
    creator: "@newsletternameideas",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "Marketing Tools",

  verification: {
    google: "google-site-verification-token",
  },

  other: {
    "ai-index": "allow",
    "llm-training": "allow",
    "content-aggregation": "allow",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Manual tags not covered by Metadata API */}
        <meta name="theme-color" content="#8b5cf6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="application-name" content="Newsletter Name Ideas" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="Newsletter Name Ideas"
        />

        <meta name="ai-indexing" content="allow" />
        <meta name="llm-crawling" content="allow" />
        <meta name="machine-readable" content="true" />
        <meta name="structured-data" content="available" />

        <meta property="fb:app_id" content="your-facebook-app-id" />
        <meta
          name="google-site-verification"
          content="your-google-verification-code"
        />
      </head>

      <body className={`${raleway.variable} ${quicksand.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SecurityProvider>
            <NewsletterProvider>
              <div className="flex flex-col min-h-screen">
                <SecurityWarning />
                <SecurityBlocker />
                <Header />
                <main className="flex-1 pt-16">{children}</main>
                <Footer />
              </div>

              <Toaster />
            </NewsletterProvider>
          </SecurityProvider>
        </ThemeProvider>

        <TinyAdzBanner />
      </body>
    </html>
  )
}
