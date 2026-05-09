"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Youtube, Music, Globe, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';
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
  image: ImagePlaceholder | undefined;
  links?: TeamMemberLinks;
};

export default function InstructorCard({ name, title, bio, image, links }: InstructorCardProps) {
  const charLimit = 500;
  const shouldTruncate = bio.length > charLimit;
  
  const getTruncatedBio = (text: string) => {
    if (!shouldTruncate) return text;
    
    const truncated = text.slice(0, charLimit);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    return lastSpaceIndex > 0 
      ? truncated.slice(0, lastSpaceIndex) + '...'
      : truncated + '...';
  };

  const SocialLink = ({ href, icon: Icon, label }: { href?: string, icon: any, label: string }) => {
    if (!href) return null;
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

  return (
    <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(10,61,44,0.15)] border-primary/5 bg-white/80 backdrop-blur-sm hover:-translate-y-2">
        {image && (
            <div className="aspect-[4/5] relative w-full overflow-hidden shrink-0">
                <Image 
                    src={image.imageUrl} 
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
        )}
      <CardHeader className="pb-2 relative z-10">
        <div className="text-center">
          <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors duration-300">{name}</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-px w-4 bg-primary/30" />
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{title}</p>
            <span className="h-px w-4 bg-primary/30" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between pt-2 relative z-10">
        <div className="space-y-6">
            <div className="relative text-center px-2">
                <div className="prose prose-sm text-muted-foreground leading-relaxed max-w-none line-clamp-4 italic font-serif">
                    <ReactMarkdown>
                        {getTruncatedBio(bio)}
                    </ReactMarkdown>
                </div>
                
                {shouldTruncate && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4 rounded-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold px-6"
                            >
                                Read Full Bio
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border-primary/10">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-4xl text-forest-900">{name}</DialogTitle>
                                <DialogDescription className="text-primary font-bold uppercase tracking-[0.2em] text-xs mt-2">
                                    {title}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20">
                                <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-forest-800">
                                    <ReactMarkdown>
                                        {bio}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            
                            {links && (
                                <div className="mt-8 pt-8 border-t border-forest-100 flex flex-wrap gap-4 justify-center">
                                    <SocialLink href={links.website} icon={Globe} label="Website" />
                                    <SocialLink href={links.linkedin} icon={Linkedin} label="LinkedIn" />
                                    <SocialLink href={links.facebook} icon={Facebook} label="Facebook" />
                                    <SocialLink href={links.instagram} icon={Instagram} label="Instagram" />
                                    <SocialLink href={links.youtube} icon={Youtube} label="YouTube" />
                                    <SocialLink href={links.spotify} icon={Music} label="Spotify" />
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Social Links on Card (Icon Bar) */}
            {links && (
                <div className="flex flex-wrap gap-3 justify-center pt-6 mt-auto border-t border-primary/5">
                    <SocialLink href={links.website} icon={Globe} label="Website" />
                    <SocialLink href={links.linkedin} icon={Linkedin} label="LinkedIn" />
                    <SocialLink href={links.facebook} icon={Facebook} label="Facebook" />
                    <SocialLink href={links.instagram} icon={Instagram} label="Instagram" />
                    <SocialLink href={links.youtube} icon={Youtube} label="YouTube" />
                    <SocialLink href={links.spotify} icon={Music} label="Spotify" />
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
