"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchButtonsFromFirebase, ButtonConfig } from '@/lib/buttons';
import { fetchLinksFromFirebase, ExternalLink, getLinks as getStaticLinks } from '@/lib/links';
import { getButtons as getStaticButtons } from '@/lib/buttons';

interface DataContextType {
  buttons: ButtonConfig[];
  links: ExternalLink[];
  getLink: (id: string) => ExternalLink | undefined;
  getButton: (id: string) => ButtonConfig | undefined;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [buttons, setButtons] = useState<ButtonConfig[]>(getStaticButtons());
  const [links, setLinks] = useState<ExternalLink[]>(getStaticLinks());
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [fetchedButtons, fetchedLinks] = await Promise.all([
        fetchButtonsFromFirebase(),
        fetchLinksFromFirebase()
      ]);
      setButtons(fetchedButtons);
      setLinks(fetchedLinks);
    } catch (error) {
      console.error("[DataProvider] Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getLink = (id: string) => links.find(l => l.id === id);
  const getButton = (id: string) => buttons.find(b => b.id === id);

  return (
    <DataContext.Provider value={{ buttons, links, getLink, getButton, isLoading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
