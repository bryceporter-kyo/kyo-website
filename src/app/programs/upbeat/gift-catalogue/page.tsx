"use client";

import React, { useState } from 'react';
import { CATALOGUE_ITEMS, CatalogueItem } from '@/lib/catalogue-items';
import GiftCatalogueHero from './_components/GiftCatalogueHero';
import CampaignIntro from './_components/CampaignIntro';
import GiftCard from './_components/GiftCard';
import AddOnCard from './_components/AddOnCard';
import BundleCard from './_components/BundleCard';
import VariableContributionCard from './_components/VariableContributionCard';
import InstructionSection from './_components/InstructionSection';
import CatalogueDonationModal from './_components/CatalogueDonationModal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function UpbeatGiftCataloguePage() {
  const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDonate = (item: CatalogueItem) => {
    try {
      // @ts-ignore
      window.va?.track('gift_catalogue_donate_click', { item_id: item.id });
    } catch (e) {
      // ignore
    }
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Filter items by category & type
  const outfitItems = CATALOGUE_ITEMS.filter((i) =>
    ['small-violin-outfit', 'violin-outfit', 'viola-outfit', 'cello-outfit'].includes(i.id)
  );
  const dedicationItem = CATALOGUE_ITEMS.find((i) => i.id === 'dedication');
  const standItem = CATALOGUE_ITEMS.find((i) => i.id === 'music-stand');
  const rosinItem = CATALOGUE_ITEMS.find((i) => i.id === 'shatterproof-rosin');
  const bundleItem = CATALOGUE_ITEMS.find((i) => i.id === 'practice-package');
  const bowItem = CATALOGUE_ITEMS.find((i) => i.id === 'student-bow');
  const bassItem = CATALOGUE_ITEMS.find((i) => i.id === 'bass-repairs');
  const instructionItems = CATALOGUE_ITEMS.filter((i) => i.category === 'instruction');

  return (
    <div className="min-h-screen bg-background">
      {/* 3.2 Hero */}
      <GiftCatalogueHero />

      {/* 3.3 Campaign Introduction */}
      <CampaignIntro />

      {/* 5. Instruments Catalogue */}
      <section id="instruments" className="scroll-mt-24 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 space-y-16">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              Category I
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
              Instruments & Equipment
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Put quality, durable instruments and essential practice gear into the hands of eager young musicians.
            </p>
          </div>

          {/* 5.1 Main Instrument Outfits */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-headline text-foreground">
              Student Instrument Outfits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {outfitItems.map((item) => (
                <GiftCard key={item.id} item={item} onDonate={handleOpenDonate} />
              ))}
            </div>
          </div>

          {/* 5.2 Dedication Add-On */}
          {dedicationItem && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-headline text-foreground">
                Dedication Add-On
              </h3>
              <AddOnCard item={dedicationItem} onDonate={handleOpenDonate} />
            </div>
          )}

          {/* 5.3 Supporting Equipment, Bundles, and Repairs */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-headline text-foreground">
              Supporting Equipment & Maintenance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standItem && <GiftCard item={standItem} onDonate={handleOpenDonate} />}
              {rosinItem && <GiftCard item={rosinItem} onDonate={handleOpenDonate} />}
              {bundleItem && <BundleCard item={bundleItem} onDonate={handleOpenDonate} />}
              {bowItem && <GiftCard item={bowItem} onDonate={handleOpenDonate} />}
              {bassItem && (
                <div className="md:col-span-2 lg:col-span-2">
                  <VariableContributionCard item={bassItem} onDonate={handleOpenDonate} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Instruction Catalogue */}
      <InstructionSection items={instructionItems} onDonate={handleOpenDonate} />

      {/* 7. Final Campaign Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
            <Heart className="w-8 h-8 fill-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
            Thank you for bringing music to Peterborough&apos;s youth
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Every contribution directly funds instruments, instruction, and food for children in our community. If you would like to make a general donation or support KYO in another way, we welcome your support.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 font-bold shadow-lg">
              <Link href="/support-us/donate">
                Support Upbeat! with a General Donation
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 font-bold">
              <Link href="/programs/upbeat">
                Learn More About Upbeat!
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stripe Donation Modal */}
      <CatalogueDonationModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
