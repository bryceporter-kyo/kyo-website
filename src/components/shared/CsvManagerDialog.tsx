"use client";

import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Upload, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CsvManagerDialogProps {
  title: string;
  description: string;
  templateHeaders: string[];
  templateSampleRow: string[];
  instructionText: string;
  existingData?: any[];
  onUpload: (data: any[], mode: 'append' | 'overwrite') => void;
  triggerButtonText?: string;
}

export function CsvManagerDialog({
  title,
  description,
  templateHeaders,
  templateSampleRow,
  instructionText,
  existingData,
  onUpload,
  triggerButtonText = "Manage CSV"
}: CsvManagerDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingData, setPendingData] = useState<any[] | null>(null);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPendingData(null);
      setIsUploading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [templateHeaders.join(','), templateSampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadInstructions = () => {
    const blob = new Blob([instructionText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_instructions.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExistingData = () => {
    if (!existingData || existingData.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }
    const csvContent = Papa.unparse(existingData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (existingData && existingData.length > 0) {
          // Pause and ask the user whether to append or overwrite
          setPendingData(results.data);
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          // No existing data, just upload as 'overwrite' (which behaves the same)
          onUpload(results.data, 'overwrite');
          setIsUploading(false);
          setIsOpen(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast({ title: "CSV Parse Error", description: error.message, variant: "destructive" });
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const confirmUpload = (mode: 'append' | 'overwrite') => {
    if (pendingData) {
      onUpload(pendingData, mode);
    }
    setPendingData(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <FileSpreadsheet className="w-4 h-4" /> {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button variant="secondary" className="w-full justify-start rounded-xl" onClick={downloadCsvTemplate}>
            <Download className="w-4 h-4 mr-2" /> Download Template CSV
          </Button>
          
          <Button variant="secondary" className="w-full justify-start rounded-xl" onClick={downloadInstructions}>
            <FileText className="w-4 h-4 mr-2" /> Download Instructions (.txt)
          </Button>
          
          {existingData && existingData.length > 0 && (
            <Button variant="secondary" className="w-full justify-start rounded-xl border-primary/20 text-primary hover:bg-primary/5 bg-transparent" onClick={downloadExistingData}>
              <Download className="w-4 h-4 mr-2" /> Download Existing Data
            </Button>
          )}

          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Import</span>
            </div>
          </div>

          {pendingData ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mt-4 space-y-4">
              <p className="text-amber-900 font-medium text-sm text-center">
                This grant already has existing data. How would you like to handle the imported CSV?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-white border-amber-200 text-amber-900 hover:bg-amber-100" onClick={() => confirmUpload('append')}>
                  Append
                </Button>
                <Button variant="default" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => confirmUpload('overwrite')}>
                  Overwrite
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button 
                className="w-full justify-start rounded-xl bg-primary hover:bg-primary/90 text-white mt-2"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload CSV
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
