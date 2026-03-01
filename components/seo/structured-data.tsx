import { FunctionComponent } from 'react'

interface StructuredDataProps {
  data: Record<string, unknown>
}

export const StructuredData: FunctionComponent<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Generate organization structured data
export function generateOrganizationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Newsletter Name Ideas',
    description: 'AI-powered newsletter name generator and branding tools for content creators',
    url: 'https://newsletternameideas.com',
    logo: 'https://newsletternameideas.com/logo.png',
    sameAs: [
      'https://twitter.com/newsletternameideas',
      'https://linkedin.com/company/newsletternameideas',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@newsletternameideas.com',
    },
  }
}

// Generate WebApplication structured data
export function generateWebApplicationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Newsletter Name Ideas Generator',
    description: 'Generate creative newsletter names with AI, check domain availability, and verify social media handles',
    url: 'https://newsletternameideas.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI-powered newsletter name generation',
      'Domain availability checker',
      'Social media handle verification',
      'SEO name analysis',
      'Custom newsletter templates',
      'Name filtering and favorites',
    ],
    browserRequirements: 'Requires JavaScript. Compatible with all modern browsers.',
  }
}

// Generate WebSite structured data
export function generateWebSiteData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Newsletter Name Ideas',
    url: 'https://newsletternameideas.com',
    description: 'Free AI-powered newsletter name generator with domain checking and social media verification tools',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://newsletternameideas.com/newsletter-name-generator?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }
}

// Generate FAQPage structured data
export function generateFAQData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the newsletter name generator work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI-powered newsletter name generator uses advanced language models to create creative, engaging names based on your topic, target audience, and tone preferences. Simply describe your newsletter concept, and we\'ll generate dozens of unique name suggestions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I check if a domain is available for my newsletter name?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our built-in domain checker allows you to verify .com, .io, .co domain availability for your favorite newsletter names instantly, helping you secure your online presence.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the newsletter name generator free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, our newsletter name generator is completely free. You can generate unlimited names, check domains, verify social handles, and use all our tools without any cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I check social media handle availability?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! Our tools check handle availability across Twitter/X, Instagram, LinkedIn, and YouTube, ensuring you can maintain consistent branding across all platforms.',
        },
      },
    ],
  }
}

// Generate HowTo structured data for the generator
export function generateHowToData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate the Perfect Newsletter Name',
    description: 'Step-by-step guide to creating an engaging newsletter name using AI',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Describe Your Newsletter',
        text: 'Enter your newsletter topic, target audience, and the tone you want to convey',
      },
      {
        '@type': 'HowToStep',
        name: 'Generate Names',
        text: 'Click generate to receive dozens of AI-powered name suggestions tailored to your inputs',
      },
      {
        '@type': 'HowToStep',
        name: 'Filter and Save',
        text: 'Use filters to narrow down by style, star your favorites, and iterate on the best options',
      },
      {
        '@type': 'HowToStep',
        name: 'Check Availability',
        text: 'Verify domain and social media handle availability for your top choices',
      },
      {
        '@type': 'HowToStep',
        name: 'Launch Your Newsletter',
        text: 'Once you\'ve found the perfect name, secure your domain and social handles to start building your brand',
      },
    ],
  }
}

// Generate Article structured data for content pages
export function generateArticleData({
  title,
  description,
  datePublished,
  dateModified,
}: {
  title: string
  description: string
  datePublished: string
  dateModified: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Organization',
      name: 'Newsletter Name Ideas',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Newsletter Name Ideas',
      logo: {
        '@type': 'ImageObject',
        url: 'https://newsletternameideas.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://newsletternameideas.com',
    },
  }
}
