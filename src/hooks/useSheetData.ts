import { useState, useCallback, useEffect } from 'react';
import { fetchAllSheetData } from '../services/sheets';
import type { SheetData } from '../types';

// Module-level cache — persists across component mounts/unmounts for the session
let _cache: SheetData | null = null;
let _cacheTime: Date | null = null;

export interface SheetDataResult {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  refresh: () => void;
}

export function useSheetData(): SheetDataResult {
  const [data, setData] = useState<SheetData | null>(_cache);
  const [loading, setLoading] = useState<boolean>(_cache === null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(_cacheTime);

  const load = useCallback(async (force = false) => {
    if (_cache !== null && !force) {
      setData(_cache);
      setLastRefreshed(_cacheTime);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllSheetData();
      _cache = result;
      _cacheTime = new Date();
      setData(result);
      setLastRefreshed(_cacheTime);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load data from Google Sheet. Check the sheet is published and the URL is correct.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    lastRefreshed,
    refresh: () => void load(true),
  };
}
