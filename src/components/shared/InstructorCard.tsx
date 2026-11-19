"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, Youtube, Music, Globe, Twitter, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TeamMemberLinks } from "@/lib/staff";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type InstructorCardProps = {
  name: string;
  title: string;
  bio: string;
  image: ImagePlaceholder | string | undefined;
  links?: TeamMemberLinks;
  isOnLeave?: boolean;
  leaveNote?: string;
  /** Firestore document ID — used for deep-linking from Case for Support */
  memberId?: string;
  /** If true, automatically open the bio dialog on mount */
  initialOpen?: boolean;
};

export default function InstructorCard({
  name,
  title,
  bio,
  image,
  links,
  isOnLeave,
  leaveNote,
  memberId,
  initialOpen,
}: InstructorCardProps) {
  const charLimit = 300;
  const previewBio = bio.length > charLimit
    ? bio.slice(0, bio.lastIndexOf(" ", charLimit)) + "…"
    : bio;

  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-open and scroll-to if this card matches the deep-link target
  useEffect(() => {
    if (initialOpen) {
      // Small delay to let the page settle before opening
      const timer = setTimeout(() => {
        setOpen(true);
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [initialOpen]);

  const SocialLink = ({ href, icon: Icon, label }: { href?: string; icon: any; label: string }) => {
    if (!href || !href.trim()) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
        title={label}
      >
        <Icon className="w-4 h-4" />
      </a>
    );
  };

  const hasAnyLink = links
    ? Object.values(links).some((url) => Boolean(url && typeof url === "string" && url.trim().length > 0))
    : false;

  const imgSrc = image
    ? typeof image === "string"
      ? image
      : image.imageUrl
    : null;

  return (
    <div ref={cardRef} id={memberId ? `member-${memberId}` : undefined}>
      <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(10,61,44,0.15)] border-primary/5 bg-white/80 backdrop-blur-sm hover:-translate-y-2">
        {/* Card photo (top) */}
        {imgSrc && (
          <div className="aspect-[4/5] relative w-full overflow-hidden shrink-0">
            <Image
              src={imgSrc}
              alt={name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {isOnLeave && (
              <div className="absolute top-3 right-3 z-20">
                <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-md">
                  {leaveNote || "On Leave / Sabbatical"}
                </Badge>
              </div>
            )}
          </div>
        )}

        <CardHeader className="pb-2 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors duration-300">
                {name}
              </CardTitle>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="h-px w-4 bg-primary/30" />
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{title}</p>
              <span className="h-px w-4 bg-primary/30" />
            </div>
            {isOnLeave && !imgSrc && (
              <div className="mt-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                  {leaveNote || "On Leave / Sabbatical"}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col justify-between pt-2 relative z-10">
          <div className="space-y-6">
            <div className="relative text-left px-2">
              {/* Preview bio on card */}
              {bio && (
                <div className="prose prose-sm text-left text-muted-foreground leading-relaxed max-w-none italic font-serif">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {previewBio}
                  </ReactMarkdown>
                </div>
              )}

              {/* Dialog — always rendered so it can be opened via initialOpen */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold px-6"
                  >
                    {bio.length > charLimit ? "Read Full Bio" : "View Profile"}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-md border-primary/10 p-0 overflow-hidden">
                  {/* Dialog header with image left + name/title right */}
                  <div className="flex flex-col sm:flex-row gap-0">
                    {/* Image panel */}
                    {imgSrc && (
                      <div className="sm:w-48 md:w-56 shrink-0 relative bg-slate-100">
                        <div className="aspect-[3/4] sm:aspect-auto sm:h-full relative min-h-[180px]">
                          <Image
                            src={imgSrc}
                            alt={name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Text content */}
                    <div className="flex-1 flex flex-col p-6 md:p-8 overflow-hidden">
                      <DialogHeader className="mb-4">
                        <DialogTitle className="font-headline text-3xl md:text-4xl text-forest-900 text-left leading-tight">
                          {name}
                        </DialogTitle>
                        <DialogDescription className="text-primary font-bold uppercase tracking-[0.2em] text-xs mt-1 text-left">
                          {title}
                          {isOnLeave && ` • (${leaveNote || "On Leave / Sabbatical"})`}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 text-left">
                        <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-p:text-forest-800 prose-p:mb-4 prose-headings:font-headline prose-strong:text-slate-900 text-left text-sm md:text-base">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {bio}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {hasAnyLink && links && (
                        <div className="mt-6 pt-6 border-t border-forest-100 flex flex-wrap gap-3">
                          <SocialLink href={links.website} icon={Globe} label="Website" />
                          <SocialLink href={links.spotify} icon={Music} label="Spotify" />
                          <SocialLink href={links.linkedin} icon={Linkedin} label="LinkedIn" />
                          <SocialLink href={links.instagram} icon={Instagram} label="Instagram" />
                          <SocialLink href={links.facebook} icon={Facebook} label="Facebook" />
                          <SocialLink href={links.youtube} icon={Youtube} label="YouTube" />
                          <SocialLink href={links.twitter} icon={Twitter} label="Twitter / X" />
                          <SocialLink href={links.other} icon={ExternalLink} label="Link" />
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Social Links on Card */}
            {hasAnyLink && links && (
              <div className="flex flex-wrap gap-3 justify-center pt-6 mt-auto border-t border-primary/5">
                <SocialLink href={links.website} icon={Globe} label="Website" />
                <SocialLink href={links.spotify} icon={Music} label="Spotify" />
                <SocialLink href={links.linkedin} icon={Linkedin} label="LinkedIn" />
                <SocialLink href={links.instagram} icon={Instagram} label="Instagram" />
                <SocialLink href={links.facebook} icon={Facebook} label="Facebook" />
                <SocialLink href={links.youtube} icon={Youtube} label="YouTube" />
                <SocialLink href={links.twitter} icon={Twitter} label="Twitter / X" />
                <SocialLink href={links.other} icon={ExternalLink} label="Link" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
