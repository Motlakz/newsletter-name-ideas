import { Metadata } from "next"
import { Quicksand } from "next/font/google"
import Head from "next/head"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "sonner"

const quicksand = Quicksand({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Newsletter Name Ideas - Creative Newsletter Name Generator",
  description: "Generate creative, engaging, and memorable newsletter names for your audience with our AI-powered newsletter name generator. Find the perfect name for your email marketing campaigns.",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://newsletternameideas.com",
    title: "Newsletter Name Ideas - Creative Newsletter Name Generator",
    description: "Find the perfect name for your newsletter with our AI-powered generator. Create engaging, memorable newsletter names that resonate with your audience.",
    siteName: "Newsletter Name Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Newsletter Name Generator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter Name Ideas - Creative Newsletter Name Generator",
    description: "Generate the perfect newsletter name in seconds with our AI tool",
    images: ["/twitter-image.png"]
  },
  robots: {
    index: true,
    follow: true
  },
  category: "Marketing Tools",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="keywords" content="newsletter name generator, newsletter name ideas, AI newsletter name generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className={quicksand.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
