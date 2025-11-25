
'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const GA_TRACKING_ID = 'G-8VHXSCCM3Y';

export default function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const getConsentState = () => {
      try {
        const consentState = localStorage.getItem('kyo_cookie_consent');
        if (consentState) {
          const parsed = JSON.parse(consentState);
          // Only enable analytics if consent has been given and analytics is true
          return parsed.accepted === true && parsed.analytics === true;
        }
      } catch (e) {
        // If localStorage is not available or parsing fails, assume no consent
        return false;
      }
      // If no consent has been given yet (first visit), don't load analytics
      return false; 
    };
    
    setConsent(getConsentState());

    const handleConsentChange = () => {
        setConsent(getConsentState());
    };

    // Listen for changes to consent (e.g., after user saves preferences)
    window.addEventListener('kyo_cookie_consent_change', handleConsentChange);

    return () => {
        window.removeEventListener('kyo_cookie_consent_change', handleConsentChange);
    };

  }, [pathname]);

  if (consent === null || !consent) {
    return null;
  }

  return (
    <>
      <Script
        id="gtag-manager"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `,
        }}
      />
    </>
  );
}
