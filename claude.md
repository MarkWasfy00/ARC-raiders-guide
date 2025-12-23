# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ARC Raiders Guide is a comprehensive Next.js 16 application for the ARC Raiders game community. It features an RTL (Right-to-Left) Arabic interface and includes game items database, marketplace, real-time chat, event timers, and trader information.

## Development Commands

### Local Development
```bash
npm run dev              # Start Next.js dev server on localhost:3000
```

### Database Management
```bash
npm run db:generate      # Generate Prisma client after schema changes
npm run db:push          # Push schema changes to database (development)
npm run db:migrate       # Create and apply migrations
npm run db:studio        # Open Prisma Studio for database inspection
npm run db:seed          # Seed database with initial data

# Database reset (dangerous - requires explicit consent)
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate reset --force
```

### Build & Deploy
```bash
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Docker
```bash
docker compose up -d     # Start PostgreSQL container
docker compose down      # Stop PostgreSQL container
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5 (credentials + Discord OAuth)
- **Real-time**: Socket.IO for chat messaging
- **UI**: Radix UI components, Tailwind CSS 4, shadcn/ui
- **Language**: TypeScript with strict mode
- **Styling**: RTL layout with Cairo font for Arabic

### Project Structure

#### Feature-Based Organization (`app/features/`)
Each feature is self-contained with:
- `components/` - Feature-specific React components
- `services/` - Server actions and API calls
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `index.ts` - Public exports

Features include:
- `auth/` - Registration, login, session management
- `items/` - Game items database and search
- `marketplace/` - Trading listings (WTS/WTB)
- `chat/` - Real-time messaging for trades
- `event-timers/` - Game event countdown timers
- `traders/` - NPC trader information
- `profile/` - User profile management
- `maps/` - Game maps and locations
- `explore-raiders/` - Character exploration
- `news-guides/` - Game news and guides

#### API Routes (`app/api/`)
- `auth/[...nextauth]/` - NextAuth authentication endpoints
- `event-timers/` - Event timer data
- `traders/` - Trader data
- `items/` - Item CRUD operations
- `marketplace/listings/` - Marketplace listings
- `chat/` - Chat management endpoints
- `socket/` - Socket.IO server initialization

#### Database (`prisma/`)
- Custom Prisma client output: `lib/generated/prisma/client`
- Enums: Rarity, ItemType, WeaponCategory, LootArea, ListingType, PaymentType, TradeStatus, ChatStatus
- Key models: User, Item, Listing, Trade, Chat, Message, Rating
- Migrations in `prisma/migrations/`

### Authentication System

**NextAuth v5 Configuration:**
- JWT session strategy
- Providers: Credentials (email/password with bcrypt) + Discord OAuth
- Protected routes: `/dashboard`, `/traders`, `/events`
- Auth files: `lib/auth.ts` (Node.js) and `lib/auth.config.ts` (Edge-safe for middleware)
- Custom user fields: `username`, `embark_id`, `discord_username`

**User Registration Flow:**
1. Server action validates with Zod schema
2. Password hashed with bcryptjs (10 rounds)
3. Unique username/email enforced at DB level
4. OAuth users get auto-generated usernames

### Database Architecture

**Prisma Setup:**
- PostgreSQL adapter (`@prisma/adapter-pg`)
- Custom output path: `lib/generated/prisma/client`
- Singleton pattern to prevent connection exhaustion
- Connection string from `DATABASE_URL` environment variable

**Key Relationships:**
- Users have listings, trades (as buyer/seller), ratings, and chat participation
- Listings reference Items and support multiple payment types (SEEDS, ITEMS, OPEN_OFFERS)
- Chats have two participants with approval tracking for trade completion
- Messages linked to chats with read status
- Trades have status workflow: PENDING → ACCEPTED → COMPLETED

**Indexing Strategy:**
- User lookups: email, username
- Item filtering: item_type, rarity, workbench, loot_area
- Listing queries: type, status, created_at
- Chat/message queries: chatId, participants, timestamps

### Real-Time Chat System

**Socket.IO Implementation:**
- Server initialized in `app/api/socket/route.ts`
- Room-based architecture (one room per chat/listing)
- Events:
  - `join-chat` / `leave-chat` - Room management
  - `send-message` - Save to DB and broadcast
  - `mark-read` - Update read status
  - `new-message` - Broadcast to chat participants
  - `messages-read` - Notify read status changes

**Chat Features:**
- Two-participant chats linked to marketplace listings
- Both participants must approve to complete trade
- Message persistence with read tracking
- Chat status: ACTIVE, COMPLETED, CANCELLED

### Marketplace System

**Listing Types:**
- WTS (Want to Sell) - Seller creates listing
- WTB (Want to Buy) - Buyer creates listing

**Payment Options:**
- SEEDS - In-game currency amount
- ITEMS - Specific items with quantities (via ListingItem relation)
- OPEN_OFFERS - Accept any reasonable offer

**Trade Workflow:**
1. Listing created with item, quantity, and payment preference
2. Interested users initiate chat
3. Both participants approve in chat
4. Trade marked COMPLETED
5. Optional rating system (1-5 stars + honesty flag)

### Path Aliases

TypeScript path alias `@/*` maps to project root, enabling imports like:
```typescript
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
```

## Important Development Notes

### Prisma Workflow
1. Modify `prisma/schema.prisma`
2. Run `npm run db:generate` to regenerate client
3. Run `npm run db:migrate` to create and apply migration
4. Never import from `@prisma/client` - always use `@/lib/generated/prisma/client`

### Authentication
- Server components: Use `await auth()` from `lib/auth.ts`
- Client components: Use `useSession()` from `next-auth/react`
- Protected API routes: Check session with `await auth()`
- User ID available in session: `session.user.id`

### RTL Layout
- HTML dir="rtl" and lang="ar" set globally
- Tailwind uses logical properties (start/end instead of left/right)
- Use `mr-*` for margin-right (becomes margin-left in LTR contexts)
- Cairo font loaded via next/font/google

### Server Actions
- Located in feature `services/` directories (e.g., `app/features/auth/services/auth-actions.ts`)
- All require `"use server"` directive
- Return objects with success/error structure
- Use Zod for input validation
- Handle Prisma errors appropriately

### Socket.IO Integration
- Next.js runs Socket.IO server via API route
- Client connects to `/api/socket` path
- Must join room before receiving messages
- Always handle disconnection cleanup

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string for session encryption
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)
- `DISCORD_CLIENT_ID` - Discord OAuth app ID (optional)
- `DISCORD_CLIENT_SECRET` - Discord OAuth secret (optional)

### Database Seeding
- Seed script: `lib/seedItems.ts`
- Populates items from JSON data in `lib/data/`
- Run with `npm run db:seed`

### Component Library
- Uses shadcn/ui components in `components/ui/`
- Radix UI primitives for accessibility
- Tailwind CSS 4 for styling
- Lucide React for icons

## Common Pitfalls

1. **Prisma Client Import**: Always import from `@/lib/generated/prisma/client`, not `@prisma/client`
2. **Session in Layouts**: Root layout fetches session server-side, wrapped in SessionProvider for client access
3. **Socket.IO Path**: Must match server configuration (`/api/socket`)
4. **Protected Routes**: Add to `authConfig.callbacks.authorized` check
5. **Database Resets**: Migrations are tracked - use `migrate reset` carefully
6. **RTL Margins**: Use logical properties (start/end) or be aware of RTL conversion
7. **Unique Constraints**: Username and email must be unique - handle duplicate errors gracefully
