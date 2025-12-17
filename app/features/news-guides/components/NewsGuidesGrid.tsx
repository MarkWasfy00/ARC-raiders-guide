import { NewsGuideCard } from './NewsGuideCard';
import { NewsGuideData } from '../types';

// Sample 12 news/guide articles
const articles: NewsGuideData[] = [
  {
    id: '1',
    title: 'Beginner\'s Guide to Arc Raiders',
    description: 'Everything you need to know to get started in Arc Raiders, from basic mechanics to advanced strategies.',
    imageUrl: '/images/news/beginners-guide.jpg',
    href: '/guides/beginners-guide'
  },
  {
    id: '2',
    title: 'New Update Brings Major Changes',
    description: 'The latest patch introduces new weapons, balance changes, and gameplay improvements.',
    imageUrl: '/images/news/update.jpg',
    href: '/news/latest-update'
  },
  {
    id: '3',
    title: 'Top 10 Weapons Tier List',
    description: 'A comprehensive ranking of the best weapons in Arc Raiders for competitive play.',
    imageUrl: '/images/news/weapons-tier.jpg',
    href: '/guides/weapons-tier-list'
  },
  {
    id: '4',
    title: 'Map Strategies: Dam Battlegrounds',
    description: 'Learn the best routes, loot locations, and tactical positions on Dam Battlegrounds.',
    imageUrl: '/images/news/dam-strategy.jpg',
    href: '/guides/dam-battlegrounds-strategy'
  },
  {
    id: '5',
    title: 'How to Build the Perfect Loadout',
    description: 'Optimize your equipment and skills for different playstyles and situations.',
    imageUrl: '/images/news/loadout-guide.jpg',
    href: '/guides/perfect-loadout'
  },
  {
    id: '6',
    title: 'Arc Types Explained',
    description: 'A detailed breakdown of all Arc types, their abilities, and when to use them.',
    imageUrl: '/images/news/arc-types.jpg',
    href: '/guides/arc-types-explained'
  },
  {
    id: '7',
    title: 'Community Spotlight: Best Plays',
    description: 'Watch the most impressive plays and clutch moments from the Arc Raiders community.',
    imageUrl: '/images/news/community-spotlight.jpg',
    href: '/news/community-spotlight'
  },
  {
    id: '8',
    title: 'Trading Tips and Tricks',
    description: 'Maximize your profits and get the best deals when trading with NPCs.',
    imageUrl: '/images/news/trading-tips.jpg',
    href: '/guides/trading-tips'
  },
  {
    id: '9',
    title: 'Skill Tree Optimization Guide',
    description: 'Plan your character progression with our detailed skill tree analysis and recommendations.',
    imageUrl: '/images/news/skill-tree.jpg',
    href: '/guides/skill-tree-optimization'
  },
  {
    id: '10',
    title: 'Upcoming Events and Seasons',
    description: 'Get ready for upcoming events, seasonal content, and limited-time rewards.',
    imageUrl: '/images/news/upcoming-events.jpg',
    href: '/news/upcoming-events'
  },
  {
    id: '11',
    title: 'Survival Tips for New Players',
    description: 'Essential survival strategies to help you stay alive longer and extract successfully.',
    imageUrl: '/images/news/survival-tips.jpg',
    href: '/guides/survival-tips'
  },
  {
    id: '12',
    title: 'Developer Interview: Future Plans',
    description: 'The development team shares their vision for the future of Arc Raiders.',
    imageUrl: '/images/news/dev-interview.jpg',
    href: '/news/developer-interview'
  }
];

export function NewsGuidesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {articles.map((article) => (
        <NewsGuideCard key={article.id} article={article} />
      ))}
    </div>
  );
}
