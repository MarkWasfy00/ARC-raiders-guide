'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { TraderCard } from './TraderCard';
import { TradersData, TraderName, TraderItem } from '../types';
import { cn } from '@/lib/utils';

interface TradersContentProps {
  data: TradersData;
}

const traderTabs: { name: TraderName; label: string }[] = [
  { name: 'Apollo', label: 'Apollo' },
  { name: 'Celeste', label: 'Celeste' },
  { name: 'Lance', label: 'Lance' },
  { name: 'Shani', label: 'Shani' },
  { name: 'TianWen', label: 'Tian Wen' },
];

const itemTypes = [
  "All Types",
  "Quick Use",
  "Topside Material",
  "Basic Material",
  "Nature",
  "Augment",
  "Shield",
  "Gadget",
  "Key",
  "Modification",
  "Weapon",
  "Ammunition"
] as const;

const rarities = ["All Rarities", "Common", "Uncommon", "Rare", "Epic"] as const;

export function TradersContent({ data }: TradersContentProps) {
  const [activeTrader, setActiveTrader] = useState<TraderName>('Apollo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedRarity, setSelectedRarity] = useState<string>('All Rarities');

  const currentTraderItems = data[activeTrader];

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return currentTraderItems.filter((item: TraderItem) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All Types' || item.item_type === selectedType;
      const matchesRarity = selectedRarity === 'All Rarities' || item.rarity === selectedRarity;
      return matchesSearch && matchesType && matchesRarity;
    });
  }, [currentTraderItems, searchQuery, selectedType, selectedRarity]);

  return (
    <div className="space-y-6">
      {/* Trader Tabs */}
      <div className="flex flex-wrap gap-2">
        {traderTabs.map((trader) => (
          <button
            key={trader.name}
            onClick={() => setActiveTrader(trader.name)}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTrader === trader.name
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border"
            )}
          >
            {trader.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full bg-card border border-border rounded-lg px-4 py-2 pl-10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none cursor-pointer"
        >
          {itemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Rarity Filter */}
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none cursor-pointer"
        >
          {rarities.map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {currentTraderItems.length} items
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <TraderCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedType !== 'All Types' || selectedRarity !== 'All Rarities'
              ? 'No items found matching your filters'
              : 'No items available for this trader'}
          </p>
        </div>
      )}
    </div>
  );
}
