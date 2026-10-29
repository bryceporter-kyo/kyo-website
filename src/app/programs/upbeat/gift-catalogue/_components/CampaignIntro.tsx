import React from 'react';

export default function CampaignIntro() {
  return (
    <section className="py-12 md:py-16 bg-muted/20 border-b">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6 text-foreground/90 text-base md:text-lg leading-relaxed">
          <p>
            This year, KYO is thrilled to launch the <strong>Upbeat! Holiday Gift Catalogue</strong>. This is a wonderful way to embrace the spirit of giving through a gift that is distinctly local, deeply meaningful, and wonderfully musical.
          </p>
          <p>
            Inside, you will find tangible ways to directly impact our young musicians: from beautifully crafted instruments to sturdy music stands, from providing weekly nutritious snacks to full-year instructional scholarships. Every gift in this catalogue fulfills a real, practical need in our program and empowers a child in our community to learn, grow, and thrive through music.
          </p>
          <p>
            Whether you are honoring a loved one with a gift in their name or helping ensure a young player has an instrument that fits, your generosity keeps our ensembles playing.
          </p>
          <p className="font-semibold text-primary pt-2">
            Thank you for sharing the joy of music and making a lasting difference this holiday season!
          </p>
        </div>
      </div>
    </section>
  );
}
