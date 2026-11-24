"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchAnnouncementsFromFirebase, Announcement } from '@/lib/announcements';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Calendar as CalendarIcon, MapPin, ExternalLink, Download, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * Derives a human-friendly button label from a URL or uses the announcement's title
 */
function getLinkButtonLabel(link: string, customLabel?: string, title?: string): string {
  if (customLabel && customLabel.trim()) return customLabel.trim();

  try {
    const url = link.startsWith('http') ? new URL(link) : new URL(link, 'https://thekyo.ca');
    const path = url.pathname.replace(/\/$/, '');
    
    // Check known paths for clean labels
    const pathLabels: Record<string, string> = {
      '/programs/upbeat/gift-catalogue': 'Upbeat! Holiday Gift Catalogue',
      '/programs/orchestras': 'The Orchestras',
      '/programs/upbeat': 'Upbeat! Program',
      '/programs/lessons': 'Instrumental Lessons',
      '/programs/calendar': 'View Calendar',
      '/support-us/donate': 'Donate Now',
      '/support-us/ways-to-give': 'Ways to Give',
      '/support-us/volunteer': 'Volunteer With KYO',
      '/about': 'About Us',
      '/team': 'Meet the Team',
      '/contact': 'Contact Us',
    };

    if (pathLabels[path]) return pathLabels[path];

    // If there is a last path segment (e.g. /programs/something -> Something)
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      const cleaned = last.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      if (cleaned.length > 2) return cleaned;
    }

    if (title && title.length < 35) return title;
    return 'View Page';
  } catch {
    return title && title.length < 35 ? title : 'View Page';
  }
}

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const [activePopup, setActivePopup] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkPopups = async () => {
      try {
        const announcements = await fetchAnnouncementsFromFirebase();
        
        // Find if there is an announcement targeting the current pathname
        const matchingPopup = announcements.find(a => {
          if (!a.popupPage) return false;
          // Normalize paths (e.g. support matching "/" or exact pages)
          const targetPath = a.popupPage.trim().toLowerCase();
          const currentPath = pathname.toLowerCase();
          
          if (targetPath !== currentPath) return false;

          // Check if already dismissed in session
          const isDismissed = sessionStorage.getItem(`dismissed-popup-${a.id}`);
          return !isDismissed;
        });

        if (matchingPopup) {
          setActivePopup(matchingPopup);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('[Popup] Error checking announcements:', err);
      }
    };

    checkPopups();
  }, [pathname]);

  const handleClose = () => {
    if (activePopup) {
      sessionStorage.setItem(`dismissed-popup-${activePopup.id}`, 'true');
    }
    setIsOpen(false);
    setActivePopup(null);
  };

  if (!activePopup) return null;

  const hasMetaSidebar = Boolean(
    activePopup.location || 
    (activePopup.attachments && activePopup.attachments.length > 0)
  );

  const buttonText = activePopup.link
    ? getLinkButtonLabel(activePopup.link, activePopup.linkLabel, activePopup.title)
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent hideCloseButton className="max-w-2xl sm:rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        {/* Banner Header with high-contrast Close button */}
        <div className="bg-primary px-6 py-6 sm:px-8 sm:py-7 text-white relative">
          {/* Subtle background bell icon watermark */}
          <div className="absolute top-2 right-12 opacity-10 pointer-events-none select-none">
            <Bell className="w-28 h-28" />
          </div>

          {/* Highly visible, accessible custom close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-150 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/80 active:scale-95 z-20 cursor-pointer shadow-sm"
            aria-label="Close announcement dialog"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <DialogHeader className="pr-10 relative z-10 text-left">
            <div className="flex items-center gap-2 text-white/80 mb-2 font-medium">
              <CalendarIcon className="w-4 h-4 text-secondary/90" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                {format(new Date(activePopup.date), 'MMMM d, yyyy')}
              </span>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-headline font-bold leading-snug tracking-tight text-white">
              {activePopup.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {hasMetaSidebar ? (
            /* Layout with sidebar for location/attachments */
            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-7 lg:col-span-8 space-y-5">
                {activePopup.imageUrl && (
                  <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                    <img
                      src={activePopup.imageUrl}
                      alt={activePopup.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
                
                <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-primary prose-a:font-semibold">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {activePopup.content}
                  </ReactMarkdown>
                </div>

                {activePopup.link && (
                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full sm:w-auto px-6 py-5 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-all hover:shadow-md"
                    >
                      <Link href={activePopup.link} target="_blank" rel="noopener noreferrer">
                        <span>{buttonText}</span>
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="md:col-span-5 lg:col-span-4 space-y-4">
                {activePopup.location && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Location</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm leading-snug">{activePopup.location}</p>
                  </div>
                )}

                {activePopup.attachments && activePopup.attachments.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FileText className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Documents</span>
                    </div>
                    <div className="space-y-1.5">
                      {activePopup.attachments.map((file, idx) => (
                        <Button
                          key={idx}
                          asChild
                          variant="outline"
                          className="w-full justify-between rounded-lg bg-white hover:bg-primary/5 hover:text-primary text-xs h-9 border-slate-200"
                        >
                          <Link href={file.url} target="_blank" rel="noopener noreferrer">
                            <span className="truncate max-w-[130px] font-medium">{file.name}</span>
                            <Download className="w-3.5 h-3.5 shrink-0 ml-1.5" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Clean unified flow without awkward empty right column */
            <div className="max-w-2xl mx-auto space-y-5">
              {activePopup.imageUrl && (
                <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100">
                  <img
                    src={activePopup.imageUrl}
                    alt={activePopup.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-primary prose-a:font-semibold text-[15px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {activePopup.content}
                </ReactMarkdown>
              </div>

              {activePopup.link && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    asChild
                    className="w-full sm:w-auto px-7 py-5 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm transition-all hover:shadow-md"
                  >
                    <Link href={activePopup.link} target="_blank" rel="noopener noreferrer">
                      <span>{buttonText}</span>
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
