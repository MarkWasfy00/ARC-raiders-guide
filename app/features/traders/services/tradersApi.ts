import { ArcRaidersAPIResponse } from '../types';

export async function fetchTraders(): Promise<ArcRaidersAPIResponse> {
  // Call our cached API route instead of MetaForge directly
  const response = await fetch('/api/traders', {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error('Failed to fetch traders data');
  }

  return response.json();
}

// Client-side fetch for use in client components
export async function fetchTradersClient(): Promise<ArcRaidersAPIResponse> {
  const response = await fetch('/api/traders');

  if (!response.ok) {
    throw new Error('Failed to fetch traders data');
  }

  return response.json();
}
