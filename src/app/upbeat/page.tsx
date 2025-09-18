
"use client";

import { useState, useEffect } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, HeartHandshake, Users, Award, Smile, BarChart, Quote, HandCoins, BookOpen, Truck, LifeBuoy } from 'lucide-react';
import Image from 'next/image';
import { getLinkById } from '@/lib/links';
import type { ExternalLink } from '@/lib/links';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const programGoals = [
    {
        icon: Award,
        title: "Accessible Music Education",
        description: "Eliminating economic and logistical barriers by offering high-quality string education (violin, viola, and cello) completely free of charge to families."
    },
    {
        icon: HeartHandshake,
        title: "Holistic Youth Development",
        description: "Supporting social-emotional growth and youth wellbeing through mentorship, ensemble participation, and a trained Wellness Coordinator."
    },
     {
        icon: Users,
        title: "Equity & Inclusion",
        description: "Offering culturally responsive, trauma-informed, and neurodivergent-inclusive programming that reflects the diversity of our participants."
    },
    {
        icon: Target,
        title: "Pathways to Progression",
        description: "Preparing students for KYO's Junior and Intermediate orchestras, aiming for RCM Grade 3 proficiency within their three-year UpBeat! trajectory."
    }
];

const impactStats = [
    { number: 87, suffix: '%', label: 'Youth Retention Rate', icon: Award, description: 'Significantly exceeding the 60% industry benchmark.' },
    { number: 92, suffix: '%', label: 'Participant Satisfaction', icon: Smile, description: 'Positive or highly positive experiences reported by students and families.' },
    { number: 100, suffix: '+', label: 'Students on Waitlist', icon: BarChart, description: 'Demonstrating a high demand for the program in our community.' },
];

export default function UpbeatPage() {
  const headerImage = PlaceHolderImages.find(p => p.id === 'page-header-upbeat');
  const aboutImage = PlaceHolderImages.find(p => p.id === 'program-upbeat');
  const kidsImage = PlaceHolderImages.find(p => p.id === 'upbeat-kids-smiling');
  const [registrationLink, setRegistrationLink] = useState<ExternalLink | undefined>(undefined);

  useEffect(() => {
    setRegistrationLink(getLinkById('register'));
  }, []);

  return (
    <div>
      <h1>Upbeat Page</h1>
    </div>
  );
}
