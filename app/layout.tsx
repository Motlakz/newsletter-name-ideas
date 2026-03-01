import { Metadata } from "next"
import { Quicksand, Raleway } from "next/font/google"
import Head from "next/head"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner"
import { NewsletterProvider } from "@/context/NewsletterContext"
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
  metadataBase: new URL('https://newsletternameideas.com'),
  title: {
    default: "Newsletter Name Ideas - Free AI Newsletter Name Generator",
    template: "%s | Newsletter Name Ideas"
  },
  description: "Generate creative, engaging, and memorable newsletter names for your audience with our AI-powered newsletter name generator. Find the perfect name for your email marketing campaigns with domain availability checking.",
  keywords: [
    "newsletter name generator",
    "newsletter names generator",
    "newsletter name ideas",
    "AI newsletter name generator",
    "email newsletter names",
    "newsletter naming tool",
    "creative newsletter names",
    "newsletter name creator",
    "newsletter title generator",
    "newsletter name ideas",
    "substack name generator",
    "newsletter branding",
    "newsletter naming ideas",
    "catchy newsletter names",
    "professional newsletter names",
    "newsletter domain checker",
    "social media handle checker",
    "newsletter name generator free",
    "free newsletter name generator",
    "newsletter title ideas",
    "catchy newsletter names list",
    "internal newsletter names",
    "catchy names for newsletters",
    "clever names for newsletters",
    "catchy newsletter titles",
    "newsletter title"
  ],
  authors: [{ name: "Newsletter Name Ideas" }],
  creator: "Newsletter Name Ideas",
  publisher: "Newsletter Name Ideas",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newsletternameideas.com",
    title: "Newsletter Name Ideas - Free AI Newsletter Name Generator",
    description: "Find the perfect name for your newsletter with our AI-powered generator. Check domain availability, create engaging names, and build your brand identity.",
    siteName: "Newsletter Name Ideas",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Newsletter Name Generator - AI Powered Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter Name Ideas - Free AI Newsletter Name Generator",
    description: "Generate the perfect newsletter name in seconds with our AI tool. Check domains, analyze SEO, and create memorable names.",
    images: ["/twitter-image.png"],
    creator: "@newsletternameideas"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "Marketing Tools",
  verification: {
    google: "google-site-verification-token",
  },

  // Additional AI/LLM indexing directives
  other: {
    'ai-index': 'allow',
    'llm-training': 'allow',
    'content-aggregation': 'allow',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8b5cf6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Additional SEO meta tags */}
        <meta name="application-name" content="Newsletter Name Ideas" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Newsletter Name Ideas" />

        {/* AI/LLM directives for content indexing */}
        <meta name="ai-indexing" content="allow" />
        <meta name="llm-crawling" content="allow" />
        <meta name="machine-readable" content="true" />
        <meta name="structured-data" content="available" />

        {/* Social media and verification */}
        <meta property="fb:app_id" content="your-facebook-app-id" />
        <meta name="google-site-verification" content="your-google-verification-code" />
      </Head>
      <body className={`${raleway.variable} ${quicksand.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NewsletterProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </NewsletterProvider>
        </ThemeProvider>
        <TinyAdzBanner />
      </body>
    </html>
  )
}
