
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [areNonEssentialCookiesEnabled, setAreNonEssentialCookiesEnabled] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('kyo_cookie_consent');
      if (consent === null) {
        setIsVisible(true);
      }
    } catch (error) {
      // localStorage is not available
    }
  }, []);

  const handleAccept = () => {
    try {
      const consentState = {
        accepted: true,
        nonEssential: areNonEssentialCookiesEnabled,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('kyo_cookie_consent', JSON.stringify(consentState));
      setIsVisible(false);
    } catch (error) {
      // localStorage is not available
    }
  };
  
  const handleSavePreferences = () => {
    handleAccept(); // Same logic as accept for now
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
                                <li>Maintain your basic preferences (e.g., language or accessibility settings)</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="analytics">
                        <AccordionTrigger className="font-bold">Analytics Cookies</AccordionTrigger>
                        <AccordionContent className="space-y-2 text-muted-foreground">
                           <p>Used by Google Analytics and Google Tag Manager to help KYO understand how visitors use the site. These help us answer questions like which pages are being visited most, how visitors found our website, or if people are using mobile devices or desktops. Google Analytics does not provide KYO with your name or identity.</p>
                           <p>We may also track button clicks, form submissions, and video engagement to improve site usability. KYO does not use advertising features or remarketing tags.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="functional">
                        <AccordionTrigger className="font-bold">Functional Cookies</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            <p>These support optional features that make browsing easier, such as remembering form progress or supporting embedded content like YouTube videos.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="flex items-center space-x-2 pt-4">
                    <Switch 
                        id="non-essential-cookies" 
                        checked={areNonEssentialCookiesEnabled}
                        onCheckedChange={setAreNonEssentialCookiesEnabled}
                    />
                    <Label htmlFor="non-essential-cookies" className="font-semibold">Non-Essential Cookies (Analytics & Functional)</Label>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button className="w-full sm:w-auto" onClick={handleAccept}>Accept All</Button>
            {showDetails ? (
                <Button className="w-full sm:w-auto" variant="outline" onClick={handleSavePreferences}>Save Preferences</Button>
            ) : (
                <Button className="w-full sm:w-auto" variant="outline" onClick={() => setShowDetails(true)}>Manage Cookies</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}

