import { createContext, useContext, useState, type ReactNode } from 'react';
import { useSheetData, type SheetDataResult } from '../hooks/useSheetData';
import type { SiteFilter } from '../types';

interface AppContextValue extends SheetDataResult {
  siteFilter: SiteFilter;
  setSiteFilter: (f: SiteFilter) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const sheetData = useSheetData();
  const [siteFilter, setSiteFilter] = useState<SiteFilter>('both');

  return (
    <AppContext.Provider value={{ ...sheetData, siteFilter, setSiteFilter }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
