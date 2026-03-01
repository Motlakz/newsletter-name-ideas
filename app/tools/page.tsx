import { Metadata } from "next"
import ToolsClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Newsletter Tools - Domain Checker, Social Handle Verification & SEO",
  description: "Check domain availability, verify social media handles, and generate SEO-friendly newsletter names. All-in-one toolkit for newsletter creators.",
  keywords: [
    "domain checker",
    "newsletter domain checker",
    "social media handle checker",
    "newsletter tools",
    "newsletter SEO",
    "verify social handles",
    "check domain availability",
    "newsletter branding tools",
    "social handle availability",
    "domain name checker",
    "newsletter title generator",
    "newsletter title ideas",
    "creative newsletter names",
    "catchy newsletter names list",
    "catchy newsletter titles",
    "newsletter name generator free"
  ],
  openGraph: {
    title: "Newsletter Tools - Domain Checker, Social Handle Verification & SEO",
    description: "Check domain availability, verify social media handles, and generate SEO-friendly newsletter names. All-in-one toolkit for newsletter creators.",
    url: "https://newsletternameideas.com/tools",
    type: "website",
  },
  alternates: {
    canonical: "https://newsletternameideas.com/tools",
  },
}

export default function ToolsPage() {
  return <ToolsClientPage />
}
