import { Metadata } from 'next';
import { Traders } from '../features/traders';

export const metadata: Metadata = {
  title: 'Traders | Arc Raiders Guide',
  description: 'Browse items available from all traders in Arc Raiders. Find the best deals from Apollo, Celeste, Lance, Shani, and Tian Wen.',
};

export default function TradersPage() {
  return (
    <main className="min-h-screen">
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
