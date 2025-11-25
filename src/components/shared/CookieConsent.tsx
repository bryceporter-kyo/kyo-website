
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [functionalEnabled, setFunctionalEnabled] = useState(true);

  const getConsentState = () => {
    try {
      const consent = localStorage.getItem('kyo_cookie_consent');
      if (consent) {
        return JSON.parse(consent);
      }
    } catch (error) {
      // localStorage is not available or error parsing
    }
    return null;
  };

  useEffect(() => {
    const consent = getConsentState();
    if (consent === null) {
      setIsVisible(true);
    } else {
      setAnalyticsEnabled(consent.analytics);
      setFunctionalEnabled(consent.functional);
    }
    
    const handleOpenSettings = () => {
        setIsVisible(true);
        setShowDetails(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);

    return () => {
        window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const handleSave = (acceptedAll = false) => {
    try {
      const consentState = {
        accepted: true,
        analytics: acceptedAll ? true : analyticsEnabled,
        functional: acceptedAll ? true : functionalEnabled,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('kyo_cookie_consent', JSON.stringify(consentState));
      
      // Dispatch a custom event to notify other parts of the app (like Analytics)
      window.dispatchEvent(new CustomEvent('kyo_cookie_consent_change'));

      setIsVisible(false);
    } catch (error) {
      // localStorage is not available
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Cookie className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-2xl">We Use Cookies to Improve Your Experience</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!showDetails ? (
            <p className="text-muted-foreground">
              The Kawartha Youth Orchestra (KYO) uses cookies to help our website run smoothly and to understand how visitors use our site. This information helps us improve our programs, communications, and community outreach. We only collect data that supports our charitable mission, and we do not use cookies for advertising or commercial profiling.
            </p>
          ) : (
             <div className="space-y-4">
                <p className="text-muted-foreground">
                    Some cookies are essential for the website to function. Others—such as analytics cookies—are optional and used to help us understand things like which pages are most visited, how visitors find us, and what devices people use. These optional cookies are turned on by default, but you can turn them off at any time.
                </p>
                <p className="text-muted-foreground">
                    You can learn more in our <Link href="/legal/privacy-policy" className="text-primary underline">Privacy and Cookie Policy</Link>.
                </p>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="essential">
                        <AccordionTrigger className="font-bold">Essential Cookies (Always On)</AccordionTrigger>
                        <AccordionContent className="space-y-2 text-muted-foreground">
                            <p>These cookies are required for the website to work properly. They do not store personal information.</p>
                             <ul className="list-disc list-outside pl-6">
                                <li>Keep the site secure</li>
                                <li>Load pages and features correctly</li>
                                <li>Maintain your basic preferences (e.g., cookie consent)</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="analytics">
                        <div className="flex items-center justify-between py-4">
                            <Label htmlFor="analytics-cookies" className="flex-1">
                                <AccordionTrigger className="font-bold text-left">Analytics Cookies</AccordionTrigger>
                            </Label>
                            <Switch 
                                id="analytics-cookies" 
                                checked={analyticsEnabled}
                                onCheckedChange={setAnalyticsEnabled}
                                className="ml-4"
                            />
                        </div>
                        <AccordionContent className="space-y-4 text-muted-foreground">
                           <p>Used by Google Analytics and Google Tag Manager to help KYO understand how visitors use the site. These help us answer questions like which pages are being visited most, how visitors found our website, or if people are using mobile devices or desktops. Google Analytics does not provide KYO with your name or identity.</p>
                            <div>
                                <h4 className="font-semibold text-foreground">Google Analytics Cookies</h4>
                                <ul className="list-disc list-outside pl-6 mt-2">
                                    <li><strong>_ga:</strong> Assigns a unique, randomly generated ID so we can count unique visitors and understand general traffic patterns.</li>
                                    <li><strong>ga_&lt;container-id&gt;:</strong> Tracks page views, navigation paths, and event interactions.</li>
                                    <li><strong>_gid:</strong> Tracks how visitors use the site over a single session.</li>
                                    <li><strong>_gat or dc_gtm:</strong> Manages request rates so analytics data is collected smoothly.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Google Tag Manager-Related Cookies</h4>
                                <p>Tag Manager itself generally does not set cookies, but it loads and manages other Google tags. Through it, we may track common Google Analytics event types like button clicks, form submissions, outbound link clicks, scroll depth, and video engagement.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-foreground">Other Google Services</h4>
                                <p>If used through Tag Manager or Analytics integrations, Google may also set cookies like NID or ANID to store basic preferences and support embedded Google services. KYO does not use advertising features or remarketing tags.</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="functional">
                        <div className="flex items-center justify-between py-4">
                            <Label htmlFor="functional-cookies" className="flex-1">
                                <AccordionTrigger className="font-bold text-left">Functional Cookies</AccordionTrigger>
                            </Label>
                            <Switch 
                                id="functional-cookies" 
                                checked={functionalEnabled}
                                onCheckedChange={setFunctionalEnabled}
                                className="ml-4"
                            />
                        </div>
                        <AccordionContent className="space-y-2 text-muted-foreground">
                            <p>Support optional features that make browsing easier. These cookies do not track your behaviour for advertising.</p>
                            <ul className="list-disc list-outside pl-6">
                                <li>Remember form progress</li>
                                <li>Support embedded content (e.g., YouTube videos used for educational materials or program showcases)</li>
                                <li>Save limited user preferences across sessions</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
            {!showDetails ? (
                <>
                    <Button className="w-full sm:w-auto" onClick={() => handleSave(true)}>Accept All</Button>
                    <Button className="w-full sm:w-auto" variant="outline" onClick={() => setShowDetails(true)}>Manage Cookies</Button>
                </>
            ) : (
                <Button className="w-full sm:w-auto" onClick={() => handleSave()}>Save Preferences</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
