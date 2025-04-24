import Script from 'next/script'

export default function TinyAdzBanner() {
    return (
        <Script
            src="https://app.tinyadz.com/scripts/ads.js?siteId=680a3e905a64432aa8afa901"
            type="module"
            async
            strategy="afterInteractive"
        />
    )
}