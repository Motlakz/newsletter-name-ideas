import Script from "next/script"

const AdScript = () => {
    return (
        <Script id="publisher-tag-manager" strategy="afterInteractive">
            {`
            (function(w,d,s,a){
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl='&.='+new Date().getTime(),
                    r=d.referrer;
                r=!!r && r!==d.location.href ? '&r='+r : '';
                j.async=true;
                w['.']=a;
                j.src='//pubtagmanager.com/ptm.js?id='+a+dl+r;
                f.parentNode.insertBefore(j,f);
            })(window,document,'script','3681');
            `}
        </Script>
    )
}

export default AdScript