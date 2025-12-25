'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Check,
  Filter,
  Lock,
  Search,
  Sparkles,
  Star,
  StarOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BlueprintStatus = 'needed' | 'obtained';
type VoteCategory = 'Containers' | 'Maps' | 'Events';

type Blueprint = {
  id: string;
  name: string;
  description?: string;
  image: string;
  status: BlueprintStatus;
  duplicate?: boolean;
};

type VoteEntry = {
  name: string;
  percentage: number; // stored as raw vote weight, normalized per category in UI
  category: VoteCategory;
};

type VoteToggleState = Record<VoteCategory, string[]>;

const VOTE_STORAGE_KEY = 'arc-blueprint-votes';
const USER_VOTE_STORAGE_KEY = 'arc-blueprint-user-votes';
const USER_VOTER_COUNT_KEY = 'arc-blueprint-unique-voters';

const emptyVoteToggleState: VoteToggleState = {
  Containers: [],
  Maps: [],
  Events: [],
};

const voteCategories: VoteCategory[] = ['Containers', 'Maps', 'Events'];

const normalizeVoteData = (value: unknown): Record<string, VoteEntry[]> => {
  if (!value || typeof value !== 'object') return {};
  const normalized: Record<string, VoteEntry[]> = {};
  Object.entries(value as Record<string, unknown>).forEach(([blueprintId, entries]) => {
    if (!Array.isArray(entries)) return;
    const cleaned = entries
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const name = (entry as VoteEntry).name;
        const category = (entry as VoteEntry).category;
        const percentage = Number((entry as VoteEntry).percentage);
        if (typeof name !== 'string') return null;
        if (category !== 'Containers' && category !== 'Maps' && category !== 'Events') return null;
        const safePercentage = Number.isFinite(percentage) ? Math.max(0, Math.round(percentage)) : 0;
        return { name, category, percentage: safePercentage };
      })
      .filter((entry): entry is VoteEntry => Boolean(entry));
    normalized[blueprintId] = cleaned;
  });
  return normalized;
};

const initialBlueprints: Blueprint[] = [
  {
    id: 'bp-01',
    name: 'Striker Blueprint',
    description: 'Mid-range rifle favored for scrappy firefights.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/skirmisher.webp',
    status: 'obtained',
    duplicate: true,
  },
  {
    id: 'bp-02',
    name: 'Bulwark Blueprint',
    description: 'Reinforced shield frame for aggressive pushes.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/bulwark.webp',
    status: 'obtained',
  },
  {
    id: 'bp-03',
    name: 'Sentry Blueprint',
    description: 'Automated perimeter defense platform.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/sentry.webp',
    status: 'needed',
  },
  {
    id: 'bp-04',
    name: 'Crusher Blueprint',
    description: 'Close-quarters disruption specialist.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/crusher.webp',
    status: 'needed',
  },
  {
    id: 'bp-05',
    name: 'Warden Blueprint',
    description: 'Area denial with crowd-control tools.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/warden.webp',
    status: 'needed',
  },
  {
    id: 'bp-06',
    name: 'Skirmisher Blueprint',
    description: 'Fast recon ARC built for flanks.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/skirmisher.webp',
    status: 'obtained',
  },
  {
    id: 'bp-07',
    name: 'Pulse Driver Blueprint',
    description: 'High-impact energy launcher.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/weapons.webp',
    status: 'needed',
  },
  {
    id: 'bp-08',
    name: 'Railburst Blueprint',
    description: 'Precision coil-shot platform.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    status: 'needed',
  },
  {
    id: 'bp-09',
    name: 'Seeker Drone Blueprint',
    description: 'Mobile recon drone with ping.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/arcs.webp',
    status: 'needed',
  },
  {
    id: 'bp-10',
    name: 'Stellar Flare Blueprint',
    description: 'Energy beam emitter for base defense.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/events.webp',
    status: 'needed',
  },
  {
    id: 'bp-11',
    name: 'Stasis Net Blueprint',
    description: 'Deployable slow field for crowd control.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/quests.webp',
    status: 'obtained',
  },
  {
    id: 'bp-12',
    name: 'Arc Alloy Core Blueprint',
    description: 'Upgraded core for workshop advances.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/hideout.webp',
    status: 'needed',
  },
  {
    id: 'bp-13',
    name: 'Vanguard Rifle Blueprint',
    description: 'Burst-fire rifle tuned for mid-range fights.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/weapons.webp',
    status: 'needed',
  },
  {
    id: 'bp-14',
    name: 'Helix Shotgun Blueprint',
    description: 'Close-quarters spread optimized for breach plays.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/loot.webp',
    status: 'obtained',
  },
  {
    id: 'bp-15',
    name: 'Meteor Grenade Blueprint',
    description: 'High-impact explosive for clustered targets.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/events.webp',
    status: 'needed',
  },
  {
    id: 'bp-16',
    name: 'Phantom SMG Blueprint',
    description: 'Lightweight SMG with suppressive potential.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/pvp.webp',
    status: 'obtained',
    duplicate: true,
  },
  {
    id: 'bp-17',
    name: 'Skybreaker Launcher Blueprint',
    description: 'Anti-air launcher built for raid defense.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/arcs.webp',
    status: 'needed',
  },
  {
    id: 'bp-18',
    name: 'Pulse Shield Blueprint',
    description: 'Deployable barrier that pulses suppression.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/hideout.webp',
    status: 'needed',
  },
  {
    id: 'bp-19',
    name: 'Tempest Carbine Blueprint',
    description: 'Precision carbine with controlled recoil.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/warden.webp',
    status: 'obtained',
  },
  {
    id: 'bp-20',
    name: 'Nova Mine Blueprint',
    description: 'Sticky mine that detonates in a plasma burst.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/bulwark.webp',
    status: 'needed',
  },
  {
    id: 'bp-21',
    name: 'Recon Scanner Blueprint',
    description: 'Throwable scanner that pings enemies.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/skirmisher.webp',
    status: 'needed',
  },
  {
    id: 'bp-22',
    name: 'Stormcaller Blueprint',
    description: 'Arc discharge rifle with chain potential.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/crusher.webp',
    status: 'obtained',
  },
  {
    id: 'bp-23',
    name: 'Sentinel Drone Blueprint',
    description: 'Support drone that guards a lane.',
    image: 'https://cdn.metaforge.app/arc-raiders/arcs/sentry.webp',
    status: 'needed',
  },
  {
    id: 'bp-24',
    name: 'Trailblazer Boots Blueprint',
    description: 'Mobility exo-upgrade for faster traversal.',
    image: 'https://cdn.metaforge.app/arc-raiders/guides/beginner.webp',
    status: 'needed',
  },
];

const initialLocationVotes: Record<string, VoteEntry[]> = {
  'bp-01': [
    { name: 'Ammo Crates - Spaceport', percentage: 18, category: 'Containers' },
    { name: 'Locked Weapon Cases', percentage: 12, category: 'Containers' },
    { name: 'Stella Montis - Central Plaza', percentage: 20, category: 'Maps' },
    { name: 'Loading Bay - West Racks', percentage: 15, category: 'Maps' },
    { name: 'Atlas Relay - Rooftop', percentage: 10, category: 'Maps' },
    { name: 'Raid Event Drop', percentage: 8, category: 'Events' },
    { name: 'Defense Surge Reward', percentage: 5, category: 'Events' },
    { name: 'Patrol Boss Cache', percentage: 12, category: 'Events' },
  ],
  'bp-03': [
    { name: 'Dam - Lower Hangars', percentage: 25, category: 'Maps' },
    { name: 'Spaceport - West Cargo', percentage: 20, category: 'Maps' },
    { name: 'Arc Cavern - Mid Deck', percentage: 15, category: 'Maps' },
    { name: 'Weapon Lockers', percentage: 18, category: 'Containers' },
    { name: 'Encrypted Cache', percentage: 12, category: 'Containers' },
    { name: 'Defense Surge Event', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 10, category: 'Events' },
  ],
  'bp-07': [
    { name: 'Encrypted Cache', percentage: 22, category: 'Containers' },
    { name: 'Weapon Lockers', percentage: 14, category: 'Containers' },
    { name: 'Cracked Vault', percentage: 14, category: 'Containers' },
    { name: 'Spaceport - Cargo Bay', percentage: 26, category: 'Maps' },
    { name: 'Stella Montis - Upper Atrium', percentage: 18, category: 'Maps' },
    { name: 'ARC Raid Reward', percentage: 12, category: 'Events' },
    { name: 'Horde Break Event', percentage: 12, category: 'Events' },
  ],
  'bp-02': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-04': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-05': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-06': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-08': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-09': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-10': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-11': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-12': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-13': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-14': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-15': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-16': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-17': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-18': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-19': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-20': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-21': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-22': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-23': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],
  'bp-24': [
    { name: 'Supply Crates', percentage: 12, category: 'Containers' },
    { name: 'Locked Lockers', percentage: 10, category: 'Containers' },
    { name: 'Sealed Caches', percentage: 8, category: 'Containers' },
    { name: 'Spaceport - Cargo Deck', percentage: 14, category: 'Maps' },
    { name: 'Stella Montis - Market', percentage: 11, category: 'Maps' },
    { name: 'Dam - Control Room', percentage: 9, category: 'Maps' },
    { name: 'Defense Surge', percentage: 10, category: 'Events' },
    { name: 'Escort Intercept', percentage: 8, category: 'Events' },
    { name: 'ARC Raid Reward', percentage: 6, category: 'Events' },
  ],

};

type Tab = 'needed' | 'obtained' | 'duplicates' | 'locations';

export default function BlueprintTrackerPage() {
  const [tab, setTab] = useState<Tab>('needed');
  const [searchQuery, setSearchQuery] = useState('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);
  const [favorited, setFavorited] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [activeVoteFilter, setActiveVoteFilter] = useState<VoteCategory>('Containers');
  const [showLockedNotice, setShowLockedNotice] = useState(false);
  const [voteData, setVoteData] = useState<Record<string, VoteEntry[]>>(() => initialLocationVotes);
  const [userVotes, setUserVotes] = useState<Record<string, VoteToggleState>>({});
  const [draftToggles, setDraftToggles] = useState<Record<string, VoteToggleState>>({});
  const [voterCounts, setVoterCounts] = useState<Record<string, number>>({});
  const hasHydratedVotes = useRef(false);

  const totalBlueprints = blueprints.length;
  const obtainedCount = blueprints.filter((bp) => bp.status === 'obtained').length;
  const duplicateCount = blueprints.filter((bp) => bp.status === 'obtained' && bp.duplicate).length;
  const obtainedNonDuplicateCount = obtainedCount - duplicateCount;
  const neededCount = blueprints.filter((bp) => bp.status === 'needed').length;
  const progressPercent = totalBlueprints === 0 ? 0 : Math.round((obtainedCount / totalBlueprints) * 100);

  const normalizeUserVotes = (value: unknown): Record<string, VoteToggleState> => {
    if (!value || typeof value !== 'object') return {};
    const normalized: Record<string, VoteToggleState> = {};
    Object.entries(value as Record<string, unknown>).forEach(([blueprintId, entry]) => {
      const nextState: VoteToggleState = { ...emptyVoteToggleState };
      if (Array.isArray(entry)) {
        entry.forEach((item) => {
          if (typeof item !== 'string') return;
          const [category, name] = item.split('||');
          if (!category || !name) return;
          if (category === 'Containers' || category === 'Maps' || category === 'Events') {
            nextState[category] = [...nextState[category], name];
          }
        });
      } else if (entry && typeof entry === 'object') {
        (['Containers', 'Maps', 'Events'] as VoteCategory[]).forEach((category) => {
          const list = (entry as Record<string, unknown>)[category];
          if (Array.isArray(list)) {
            nextState[category] = list.filter((item) => typeof item === 'string') as string[];
          }
        });
      }
      normalized[blueprintId] = nextState;
    });
    return normalized;
  };

  useEffect(() => {
    const storedVotes = localStorage.getItem(VOTE_STORAGE_KEY);
    const storedUserVotes = localStorage.getItem(USER_VOTE_STORAGE_KEY);
    const storedVoterCounts = localStorage.getItem(USER_VOTER_COUNT_KEY);
    if (storedVotes) {
      try {
        const parsedVotes = JSON.parse(storedVotes) as Record<string, VoteEntry[]>;
        setVoteData(normalizeVoteData(parsedVotes));
      } catch {
        // Ignore invalid stored data.
      }
    }
    if (storedUserVotes) {
      try {
        const parsedUserVotes = JSON.parse(storedUserVotes) as Record<string, unknown>;
        setUserVotes(normalizeUserVotes(parsedUserVotes));
      } catch {
        // Ignore invalid stored data.
      }
    }
    if (storedVoterCounts) {
      try {
        const parsedVoterCounts = JSON.parse(storedVoterCounts) as Record<string, number>;
        setVoterCounts(parsedVoterCounts);
      } catch {
        // Ignore invalid stored data.
      }
    }
    hasHydratedVotes.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedVotes.current) return;
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(voteData));
  }, [voteData]);

  useEffect(() => {
    if (!hasHydratedVotes.current) return;
    localStorage.setItem(USER_VOTE_STORAGE_KEY, JSON.stringify(userVotes));
  }, [userVotes]);

  useEffect(() => {
    if (!hasHydratedVotes.current) return;
    localStorage.setItem(USER_VOTER_COUNT_KEY, JSON.stringify(voterCounts));
  }, [voterCounts]);

  useEffect(() => {
    setShowLockedNotice(false);
  }, [selectedBlueprintId]);

  const filteredBlueprints = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return blueprints.filter((bp) => {
      const matchesQuery = query.length === 0 || bp.name.toLowerCase().includes(query);
      if (!matchesQuery) return false;
      if (tab === 'needed') return bp.status === 'needed';
      if (tab === 'obtained') return bp.status === 'obtained'; // include duplicates as obtained
      if (tab === 'duplicates') return bp.status === 'obtained' && bp.duplicate;
      return false;
    });
  }, [blueprints, searchQuery, tab]);

  const locationOptions = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();
    if (query.length >= 2) {
      return blueprints.filter((bp) => bp.name.toLowerCase().includes(query));
    }
    return [];
  }, [blueprints, locationQuery]);

  const selectedBlueprint = useMemo(
    () => blueprints.find((bp) => bp.id === selectedBlueprintId) ?? null,
    [blueprints, selectedBlueprintId]
  );

  const selectedVotesRaw = useMemo(
    () => (selectedBlueprint ? voteData[selectedBlueprint.id] ?? [] : []),
    [selectedBlueprint?.id, voteData]
  );

  const selectedUserVotesByCategory = useMemo(
    () => (selectedBlueprint ? userVotes[selectedBlueprint.id] ?? emptyVoteToggleState : emptyVoteToggleState),
    [selectedBlueprint?.id, userVotes]
  );

  const selectedDraftTogglesByCategory = useMemo(
    () => (selectedBlueprint ? draftToggles[selectedBlueprint.id] ?? emptyVoteToggleState : emptyVoteToggleState),
    [selectedBlueprint?.id, draftToggles]
  );

  const selectedUserVotes = useMemo(
    () => new Set(selectedUserVotesByCategory[activeVoteFilter] ?? []),
    [selectedUserVotesByCategory, activeVoteFilter]
  );

  const selectedDraftToggles = useMemo(
    () => new Set(selectedDraftTogglesByCategory[activeVoteFilter] ?? []),
    [selectedDraftTogglesByCategory, activeVoteFilter]
  );

  const userVoteSets = useMemo(
    () => ({
      Containers: new Set(selectedUserVotesByCategory.Containers ?? []),
      Maps: new Set(selectedUserVotesByCategory.Maps ?? []),
      Events: new Set(selectedUserVotesByCategory.Events ?? []),
    }),
    [selectedUserVotesByCategory]
  );

  const draftVoteSets = useMemo(
    () => ({
      Containers: new Set(selectedDraftTogglesByCategory.Containers ?? []),
      Maps: new Set(selectedDraftTogglesByCategory.Maps ?? []),
      Events: new Set(selectedDraftTogglesByCategory.Events ?? []),
    }),
    [selectedDraftTogglesByCategory]
  );

  const adjustedVotesRaw = useMemo(() => {
    if (!selectedBlueprint) return [];
    const baseVotes = selectedVotesRaw;
    const baseVoteKeys = new Set(baseVotes.map((vote) => `${vote.category}||${vote.name}`));
    const mappedVotes = baseVotes.map((vote) => {
      const draftSet = draftVoteSets[vote.category];
      if (!draftSet.has(vote.name)) return vote;
      const hasVoted = userVoteSets[vote.category].has(vote.name);
      const nextValue = Math.max(0, vote.percentage + (hasVoted ? -1 : 1));
      return { ...vote, percentage: nextValue };
    });
    (['Containers', 'Maps', 'Events'] as VoteCategory[]).forEach((category) => {
      draftVoteSets[category].forEach((name) => {
        if (userVoteSets[category].has(name)) return;
        const key = `${category}||${name}`;
        if (baseVoteKeys.has(key)) return;
        mappedVotes.push({ name, category, percentage: 1 });
      });
    });
    return mappedVotes;
  }, [selectedBlueprint?.id, draftVoteSets, userVoteSets, selectedVotesRaw]);

  const hasDraftPreview = selectedDraftToggles.size > 0;
  const userHasSavedVotes = voteCategories.some(
    (category) => (selectedUserVotesByCategory[category]?.length ?? 0) > 0
  );

  const effectiveVotesRaw = useMemo(() => {
    if (!selectedBlueprint) return [];
    const voters = voterCounts[selectedBlueprint.id] ?? 0;
    if (voters === 0 && !hasDraftPreview && !userHasSavedVotes) return [];
    return adjustedVotesRaw;
  }, [adjustedVotesRaw, hasDraftPreview, selectedBlueprint?.id, userHasSavedVotes, voterCounts]);

  const uniqueVotersCount = selectedBlueprint
    ? Math.max(voterCounts[selectedBlueprint.id] ?? 0, userHasSavedVotes ? 1 : 0)
    : 0;
  const totalVotesCount =
    uniqueVotersCount === 0 ? 0 : selectedVotesRaw.reduce((sum, vote) => sum + vote.percentage, 0);
  const hasPendingVotes = selectedDraftToggles.size > 0;
  useEffect(() => {
    if (!hasPendingVotes) setShowLockedNotice(false);
  }, [hasPendingVotes]);

  const displayVotes = useMemo(() => {
    const baseVotes = selectedVotesRaw.filter((vote) => vote.category === activeVoteFilter);
    if (uniqueVotersCount === 0) {
      const selectedDrafts = new Set(selectedDraftTogglesByCategory[activeVoteFilter] ?? []);
      const totalDrafts = selectedDrafts.size;
      if (totalDrafts === 0) {
        return baseVotes.map((vote) => ({ ...vote, percentage: 0 }));
      }
      const normalized = baseVotes.map((vote) => ({
        ...vote,
        percentage: selectedDrafts.has(vote.name) ? Math.round((1 / totalDrafts) * 100) : 0,
      }));
      const totalNormalized = normalized.reduce((sum, vote) => sum + vote.percentage, 0);
      const diff = 100 - totalNormalized;
      if (diff !== 0) {
        const lastSelectedIndex = [...normalized]
          .map((vote, index) => (selectedDrafts.has(vote.name) ? index : -1))
          .filter((index) => index >= 0)
          .pop();
        if (lastSelectedIndex !== undefined) {
          normalized[lastSelectedIndex] = {
            ...normalized[lastSelectedIndex],
            percentage: normalized[lastSelectedIndex].percentage + diff,
          };
        }
      }
      return normalized;
    }

    const categoryVotes = effectiveVotesRaw.filter((vote) => vote.category === activeVoteFilter);
    const total = categoryVotes.reduce((sum, vote) => sum + vote.percentage, 0);
    if (total > 0) {
      const normalized = categoryVotes.map((vote) => ({
        ...vote,
        percentage: Math.round((vote.percentage / total) * 100),
      }));
      const totalNormalized = normalized.reduce((sum, vote) => sum + vote.percentage, 0);
      const diff = 100 - totalNormalized;
      if (normalized.length > 0) {
        normalized[normalized.length - 1] = {
          ...normalized[normalized.length - 1],
          percentage: normalized[normalized.length - 1].percentage + diff,
        };
      }
      return normalized;
    }

    return baseVotes.map((vote) => ({ ...vote, percentage: 0 }));
  }, [
    activeVoteFilter,
    effectiveVotesRaw,
    selectedDraftTogglesByCategory,
    selectedVotesRaw,
    uniqueVotersCount,
  ]);
  const voteFillColors: Record<VoteCategory, string> = {
    Containers: 'rgba(249, 115, 22, 0.35)',
    Maps: 'rgba(96, 165, 250, 0.35)',
    Events: 'rgba(34, 197, 94, 0.35)',
  };

  const toggleFavourite = () => setFavorited((prev) => !prev);

  const updateBlueprint = (id: string, updater: (bp: Blueprint) => Blueprint) => {
    setBlueprints((prev) => prev.map((bp) => (bp.id === id ? updater(bp) : bp)));
  };

  const handleCardClick = (bp: Blueprint) => {
    if (tab === 'needed') {
      updateBlueprint(bp.id, (current) => ({ ...current, status: 'obtained' }));
    } else if (tab === 'obtained') {
      updateBlueprint(bp.id, (current) => ({ ...current, status: 'needed', duplicate: false }));
    } else if (tab === 'duplicates') {
      updateBlueprint(bp.id, (current) => ({ ...current, duplicate: false }));
    }
  };

  const handleCardRightClick = (event: MouseEvent, bp: Blueprint) => {
    event.preventDefault();
    if (tab === 'needed') {
      updateBlueprint(bp.id, (current) => ({ ...current, status: 'obtained', duplicate: true }));
    } else if (tab === 'obtained') {
      updateBlueprint(bp.id, (current) => ({ ...current, duplicate: !current.duplicate }));
    } else if (tab === 'duplicates') {
      updateBlueprint(bp.id, (current) => ({ ...current, duplicate: false }));
    }
  };

  const toggleVoteFilter = (category: VoteCategory) => {
    if (hasPendingVotes && category !== activeVoteFilter) {
      setShowLockedNotice(true);
      return;
    }
    setActiveVoteFilter(category);
    setShowLockedNotice(false);
  };

  const handleVoteToggle = (vote: VoteEntry) => {
    if (!selectedBlueprint) return;
    setDraftToggles((prev) => {
      const current = prev[selectedBlueprint.id] ?? emptyVoteToggleState;
      const existing = new Set(current[vote.category] ?? []);
      if (existing.has(vote.name)) {
        existing.delete(vote.name);
      } else {
        existing.add(vote.name);
      }
      return {
        ...prev,
        [selectedBlueprint.id]: {
          ...current,
          [vote.category]: Array.from(existing),
        },
      };
    });
  };

  const handleCancelVotes = () => {
    if (!selectedBlueprint) return;
    setDraftToggles((prev) => {
      const current = prev[selectedBlueprint.id];
      if (!current) return prev;
      return {
        ...prev,
        [selectedBlueprint.id]: { ...emptyVoteToggleState },
      };
    });
    setShowLockedNotice(false);
  };

  const handleSaveVotes = () => {
    if (!selectedBlueprint) return;
    const toggles = selectedDraftTogglesByCategory[activeVoteFilter] ?? [];
    if (toggles.length === 0) return;
    const currentUserState = userVotes[selectedBlueprint.id] ?? emptyVoteToggleState;
    const currentUserSets: Record<VoteCategory, Set<string>> = {
      Containers: new Set(currentUserState.Containers ?? []),
      Maps: new Set(currentUserState.Maps ?? []),
      Events: new Set(currentUserState.Events ?? []),
    };
    const hadAnySavedVotes = voteCategories.some((category) => currentUserSets[category].size > 0);
    let didAddVote = false;

    const applyToggles = (entries: VoteEntry[]) => {
      const updatedEntries = [...entries];
      const toggleSet = new Set(selectedDraftTogglesByCategory[activeVoteFilter] ?? []);
      if (toggleSet.size === 0) return updatedEntries;
      toggleSet.forEach((name) => {
        const entryIndex = updatedEntries.findIndex(
          (entry) => entry.category === activeVoteFilter && entry.name === name
        );
        const hasVoted = currentUserSets[activeVoteFilter].has(name);
        const delta = hasVoted ? -1 : 1;

        if (hasVoted) {
          currentUserSets[activeVoteFilter].delete(name);
        } else {
          currentUserSets[activeVoteFilter].add(name);
          didAddVote = true;
        }

        if (entryIndex >= 0) {
          const nextValue = Math.max(0, updatedEntries[entryIndex].percentage + delta);
          if (nextValue === 0) {
            updatedEntries.splice(entryIndex, 1);
          } else {
            updatedEntries[entryIndex] = { ...updatedEntries[entryIndex], percentage: nextValue };
          }
        } else if (delta > 0) {
          updatedEntries.push({ name, category: activeVoteFilter, percentage: 1 });
        }
      });
      return updatedEntries;
    };

    setVoteData((prev) => {
      const entries = prev[selectedBlueprint.id] ?? [];
      const updatedEntries = applyToggles(entries);
      return { ...prev, [selectedBlueprint.id]: updatedEntries };
    });

    setUserVotes((prev) => ({
      ...prev,
      [selectedBlueprint.id]: {
        ...currentUserState,
        Containers: Array.from(currentUserSets.Containers),
        Maps: Array.from(currentUserSets.Maps),
        Events: Array.from(currentUserSets.Events),
      },
    }));

    setDraftToggles((prev) => {
      const current = prev[selectedBlueprint.id] ?? emptyVoteToggleState;
      return {
        ...prev,
        [selectedBlueprint.id]: {
          ...current,
          [activeVoteFilter]: [],
        },
      };
    });

    if (!hadAnySavedVotes && didAddVote) {
      setVoterCounts((prev) => ({
        ...prev,
        [selectedBlueprint.id]: (prev[selectedBlueprint.id] ?? 0) + 1,
      }));
    }
    setShowLockedNotice(false);
  };

  return (
    <main className="min-h-screen">
      <div className="w-full px-[100px] py-8 space-y-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Blueprint Tracker</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border/70 rounded-full px-3 py-1 bg-muted/40">
              <Link href="/" className="hover:text-foreground transition-colors">
                Arc Raiders
              </Link>
              <span className="text-border">{'>'}</span>
              <span className="text-foreground font-semibold">Blueprint Tracker</span>
            </div>
          </div>

          <button
            onClick={toggleFavourite}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors shadow-sm',
              favorited
                ? 'border-primary/70 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-foreground hover:border-primary/60'
            )}
          >
            {favorited ? <Star className="w-4 h-4 fill-primary text-primary" /> : <StarOff className="w-4 h-4" />}
            {favorited ? 'Added to favourite' : 'Add to favourite'}
          </button>
        </div>

        {/* Intro line */}
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Track which Blueprints you've obtained in ARC Raiders. Click a blueprint to mark it as obtained. Your progress is automatically saved in your browser.
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 shadow-sm">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blueprints by name..."
            className="w-full bg-transparent focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Blueprints', value: totalBlueprints },
            { label: 'Obtained', value: obtainedCount },
            { label: 'Needed', value: neededCount },
            { label: 'Duplicates', value: duplicateCount },
            { label: 'Progress', value: `${progressPercent}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card/70 px-4 py-3 shadow-sm flex flex-col gap-1"
            >
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</span>
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              {stat.label === 'Progress' && (
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { key: 'needed', label: 'Needed', count: neededCount },
            { key: 'obtained', label: 'Obtained', count: obtainedCount },
            { key: 'duplicates', label: 'Duplicates', count: duplicateCount },
            { key: 'locations', label: 'Locations', count: undefined },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTab(filter.key as Tab)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                tab === filter.key
                  ? 'border-primary/70 bg-primary/10 text-primary shadow-sm'
                  : 'border-border text-foreground hover:border-primary/60'
              )}
            >
              {filter.label}
              {typeof filter.count === 'number' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/60">
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content panels */}
        {tab !== 'locations' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="w-4 h-4 text-primary" />
              {tab === 'needed' && (
                <span>
                  Left-click to move a blueprint to Obtained. Right-click to track it as a Duplicate.
                </span>
              )}
              {tab === 'obtained' && (
                <span>
                  Left-click to send a blueprint back to Needed. Right-click toggles its Duplicate status.
                </span>
              )}
              {tab === 'duplicates' && (
                <span>
                  Left-click removes the duplicate tag (keeps it in Obtained). Use Needed/Obtained tabs to move items between lists.
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
              {filteredBlueprints.map((bp) => (
                <button
                  key={bp.id}
                  onClick={() => handleCardClick(bp)}
                  onContextMenu={(e) => handleCardRightClick(e, bp)}
                  className="group flex flex-col items-center gap-1 p-1 text-center transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative h-16 w-16 sm:h-[72px] sm:w-[72px] md:h-20 md:w-20 rounded-lg overflow-hidden border border-border bg-transparent">
                    <Image
                      src={bp.image}
                      alt={bp.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                      {bp.name}
                    </span>
                  </div>
                </button>
              ))}
              {filteredBlueprints.length === 0 && (
                <div className="col-span-full rounded-lg border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  No blueprints match your filters yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Blueprint Location Insights</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search for a blueprint to see where the community reports finding it and cast your own votes.
                </p>
              </div>
              {selectedBlueprint && (
                <button
                  onClick={() => setSelectedBlueprintId(null)}
                  className="text-xs font-semibold rounded-full bg-orange-500 text-white px-3 py-2 shadow hover:bg-orange-600 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search blueprints for location insights..."
                className="w-full bg-transparent focus:outline-none text-sm md:text-base placeholder:text-muted-foreground/70"
              />
            </div>

            {selectedBlueprint && (
              <div className="rounded-lg border border-border bg-card/70 px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                      <Image src={selectedBlueprint.image} alt={selectedBlueprint.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedBlueprint.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedBlueprint.description ?? 'No description provided.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Unique Voters</p>
                    <p className="text-lg font-bold text-foreground">{uniqueVotersCount}</p>
                  </div>
                </div>
              </div>
            )}

            {!selectedBlueprint && locationQuery.trim().length >= 2 && (
              <div className="space-y-2">
                {locationOptions.map((bp) => (
                  <button
                    key={bp.id}
                    onClick={() => setSelectedBlueprintId(bp.id)}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-colors shadow-sm text-left',
                      selectedBlueprintId === bp.id
                        ? 'border-primary/70 bg-primary/10 text-primary'
                        : 'border-border bg-card/70 text-foreground hover:border-primary/60'
                    )}
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                      <Image src={bp.image} alt={bp.name} fill className="object-cover" />
                    </div>
                    <span className="line-clamp-2">{bp.name}</span>
                  </button>
                ))}
                {locationOptions.length === 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
                    No blueprints match that search.
                  </div>
                )}
              </div>
            )}

            {selectedBlueprint && (
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-border bg-card/70 p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Location Votes</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">Total Votes: {totalVotesCount}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {voteCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => toggleVoteFilter(category)}
                          className={cn(
                            'inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                            activeVoteFilter === category
                              ? 'border-primary/70 bg-primary/10 text-primary shadow-sm'
                              : 'border-border/70 bg-muted/30 text-foreground hover:border-primary/60 hover:bg-muted/50'
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {showLockedNotice && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-orange-500">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unsaved changes - Save or cancel to switch categories</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {displayVotes.length > 0 ? (
                        displayVotes.map((vote) => {
                          const isSelected =
                            selectedUserVotes.has(vote.name) !== selectedDraftToggles.has(vote.name);
                          return (
                            <button
                              type="button"
                              key={`${selectedBlueprint.id}-${vote.category}-${vote.name}`}
                              onClick={() => handleVoteToggle(vote)}
                              className="flex items-center gap-3 w-full text-left rounded-lg border border-border bg-muted/40 px-3 py-2 transition-colors"
                              style={{
                                backgroundImage: `linear-gradient(90deg, ${voteFillColors[vote.category]} 0%, ${voteFillColors[vote.category]} 100%)`,
                                backgroundSize: `${vote.percentage}% 100%`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'left',
                                transition: 'background-size 300ms ease',
                              }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                  <p className="text-sm font-semibold text-foreground">{vote.name}</p>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-white">{vote.percentage}%</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          No votes in this category yet.
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Every location report comes from fellow Raiders. Search a blueprint, log the spot you found it, and help the community.
                    </p>

                    {hasPendingVotes && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelVotes}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/60 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveVotes}
                          className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-orange-600 transition-colors"
                        >
                          Save votes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}




