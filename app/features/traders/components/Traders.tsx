'use client';

import { useEffect, useState } from 'react';
import { TradersContent } from './TradersContent';
import { TradersData } from '../types';
import { fetchTradersClient } from '../services/tradersApi';

export function Traders() {
  const [tradersData, setTradersData] = useState<TradersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTraders() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchTradersClient();

        if (response.success && response.data) {
          setTradersData(response.data);
        } else {
          setError('Failed to load traders data');
        }
      } catch (err) {
        console.error('Error loading traders:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    loadTraders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading traders data...</p>
        </div>
      </div>
    );
  }

  if (error || !tradersData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <p className="text-destructive font-semibold mb-2">Failed to load traders</p>
          <p className="text-muted-foreground text-sm">{error || 'No data available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <TradersContent data={tradersData} />;
}
