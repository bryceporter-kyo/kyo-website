"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchAnnouncementsFromFirebase, Announcement } from '@/lib/announcements';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, Calendar as CalendarIcon, MapPin, ExternalLink, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Bell className="w-24 h-24" />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {format(new Date(activePopup.date), 'MMMM d, yyyy')}
              </span>
            </div>
            <DialogTitle className="text-3xl font-headline font-bold leading-tight">
              {activePopup.title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-8 bg-white max-h-[60vh] overflow-y-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {activePopup.imageUrl && (
                <div className="rounded-2xl overflow-hidden shadow-md mb-6">
                  <img src={activePopup.imageUrl} alt={activePopup.title} className="w-full h-auto object-cover" />
                </div>
              )}
              
              {/* Fully supports HTML formatting, buttons, tables, custom structures */}
              <div 
                className="prose prose-slate max-w-none prose-headings:font-headline prose-headings:font-bold prose-p:font-light prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {activePopup.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              {activePopup.location && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Location</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{activePopup.location}</p>
                </div>
              )}

              {activePopup.link && (
                <Button asChild className="w-full rounded-xl py-5 bg-primary hover:bg-primary/90 text-white shadow-md">
                  <Link href={activePopup.link} target="_blank">
                    Visit Related Link
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              )}

              {activePopup.attachments && activePopup.attachments.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Documents</span>
                  </div>
                  <div className="space-y-1.5">
                    {activePopup.attachments.map((file, idx) => (
                      <Button key={idx} asChild variant="outline" className="w-full justify-between rounded-lg bg-white hover:bg-primary/5 hover:text-primary text-xs">
                        <Link href={file.url} target="_blank">
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <Download className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
