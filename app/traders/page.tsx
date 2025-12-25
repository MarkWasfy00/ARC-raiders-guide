import { Metadata } from 'next';
import { Traders } from '../features/traders';
import { StructuredData, getBreadcrumbSchema } from '@/components/StructuredData';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Traders - ARC Raiders NPC Traders',
  description: 'Browse items available from all traders in Arc Raiders. Find the best deals from Apollo, Celeste, Lance, Shani, and Tian Wen.',
  alternates: {
    canonical: `${baseUrl}/traders`,
  },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/traders`,
    title: 'Traders - ARC Raiders NPC Traders',
    description: 'Browse items available from all NPC traders in Arc Raiders. Find the best equipment and supplies.',
    siteName: '3RB',
    images: [
      {
        url: `${baseUrl}/og-traders.jpg`,
        width: 1200,
        height: 630,
        alt: 'ARC Raiders Traders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Traders - ARC Raiders NPC Traders',
    description: 'Browse items available from all NPC traders in Arc Raiders.',
    images: [`${baseUrl}/og-traders.jpg`],
  },
  keywords: ['ARC Raiders', 'traders', 'NPCs', 'Apollo', 'Celeste', 'Lance', 'Shani', 'Tian Wen', 'merchants', '3RB'],
};

export default function TradersPage() {
  return (
    <main className="min-h-screen">
      <StructuredData
        data={getBreadcrumbSchema(baseUrl, [
          { name: 'الرئيسية', url: '/' },
          { name: 'Traders', url: '/traders' },
        ])}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Traders
          </h1>
          <p className="text-muted-foreground">
            Browse items available from all traders. Each trader specializes in different types of equipment and supplies.
          </p>
        </div>

        {/* Traders Content */}
        <Traders />
      </div>
    </main>
  );
}
