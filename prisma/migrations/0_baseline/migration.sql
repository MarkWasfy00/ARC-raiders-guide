-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "WeaponCategory" AS ENUM ('ASSAULT_RIFLE', 'BATTLE_RIFLE', 'LIGHT_MACHINE_GUN', 'PISTOL', 'SHOTGUN', 'SMG', 'SNIPER_RIFLE', 'SPECIAL_WEAPON');

-- CreateEnum
CREATE TYPE "CoinType" AS ENUM ('COIN', 'RAIDER_TOKEN');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('ADVANCED_MATERIAL', 'AMMUNITION', 'AUGMENT', 'BASIC_MATERIAL', 'BLUEPRINT', 'CONSUMABLE', 'COSMETIC', 'GADGET', 'KEY', 'MATERIAL', 'MEDICAL', 'MISC', 'MODIFICATION', 'MODS', 'NATURE', 'QUEST_ITEM', 'QUICK_USE', 'RECYCLABLE', 'REFINED_MATERIAL', 'REFINEMENT', 'SHIELD', 'THROWABLE', 'TOPSIDE_MATERIAL', 'TRINKET', 'WEAPON');

-- CreateEnum
CREATE TYPE "Workbench" AS ENUM ('SCRAPPY', 'GUNSMITH', 'GEAR_BENCH', 'MEDICAL_LAB', 'EXPLOSIVES_STATION', 'UTILITY_STATION', 'REFINER', 'WORKBENCH');

-- CreateEnum
CREATE TYPE "LootArea" AS ENUM ('ARC', 'COMMERCIAL', 'MEDICAL', 'RESIDENTIAL', 'ELECTRICAL', 'TECHNOLOGICAL', 'EXODUS', 'INDUSTRIAL', 'MECHANICAL', 'NATURE', 'OLD_WORLD', 'RAIDER', 'SECURITY');

-- CreateEnum
CREATE TYPE "AmmoType" AS ENUM ('SHOTGUN', 'ENERGY', 'HEAVY', 'LAUNCHER', 'LIGHT', 'MEDIUM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('USER_REGISTERED', 'USER_LOGIN', 'USER_BANNED', 'USER_UNBANNED', 'LISTING_CREATED', 'LISTING_UPDATED', 'LISTING_DELETED', 'TRADE_COMPLETED', 'CHAT_STARTED', 'GUIDE_CREATED', 'GUIDE_UPDATED', 'GUIDE_DELETED', 'MAP_MARKER_ADDED', 'MAP_MARKER_DELETED', 'ITEM_CREATED', 'ITEM_UPDATED', 'ADMIN_ACTION', 'SYSTEM_EVENT');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('WTS', 'WTB');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SEEDS', 'ITEMS', 'OPEN_OFFERS');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'OWNER_TRADING');

-- CreateEnum
CREATE TYPE "VoteCategory" AS ENUM ('CONTAINERS', 'MAPS', 'EVENTS');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BLOG_COMMENT', 'BLOG_COMMENT_REPLY', 'CHAT_MESSAGE');

-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "SettingCategory" AS ENUM ('GENERAL', 'FEATURES', 'SECURITY', 'SYSTEM');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discord_username" TEXT,
    "embark_id" TEXT,
    "username" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "banReason" TEXT,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "item_type" "ItemType",
    "loadout_slots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "icon" TEXT,
    "rarity" "Rarity",
    "value" INTEGER NOT NULL DEFAULT 0,
    "workbench" "Workbench",
    "stat_block" JSONB NOT NULL DEFAULT '{}',
    "flavor_text" TEXT NOT NULL,
    "subcategory" TEXT,
    "shield_type" TEXT,
    "loot_area" "LootArea",
    "sources" JSONB,
    "ammo_type" "AmmoType",
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "seedsAmount" INTEGER,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "activeTraderChatId" TEXT,
    "activeTraderUserId" TEXT,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingItem" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "honest" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "participant1Approved" BOOLEAN NOT NULL DEFAULT false,
    "participant2Approved" BOOLEAN NOT NULL DEFAULT false,
    "status" "ChatStatus" NOT NULL DEFAULT 'ACTIVE',
    "participant1LockedIn" BOOLEAN NOT NULL DEFAULT false,
    "participant2LockedIn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arc" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArcLoot" (
    "id" TEXT NOT NULL,
    "arcId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArcLoot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objectives" TEXT[],
    "xp" INTEGER NOT NULL DEFAULT 0,
    "granted_items" JSONB NOT NULL DEFAULT '[]',
    "marker_category" TEXT,
    "image" TEXT,
    "required_items" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "locations" JSONB NOT NULL DEFAULT '[]',
    "guide_links" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestReward" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchPlanner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "Workbench" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkbenchPlanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchPlannerLevel" (
    "id" TEXT NOT NULL,
    "workbenchId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "levelName" TEXT,
    "rates" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkbenchPlannerLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchPlannerRequirement" (
    "id" TEXT NOT NULL,
    "workbenchLevelId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbenchPlannerRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkbenchPlannerCraft" (
    "id" TEXT NOT NULL,
    "workbenchLevelId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkbenchPlannerCraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlueprintLocationVote" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "category" "VoteCategory" NOT NULL,
    "userIp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlueprintLocationVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapMarker" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "zlayers" INTEGER NOT NULL DEFAULT 2147483647,
    "mapID" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "instanceName" TEXT,
    "behindLockedDoor" BOOLEAN NOT NULL DEFAULT false,
    "eventConditionMask" INTEGER NOT NULL DEFAULT 1,
    "lootAreas" JSONB,
    "addedByUserId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapMarker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapAreaLabel" (
    "id" TEXT NOT NULL,
    "mapID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "color" TEXT NOT NULL DEFAULT '#ffffff',
    "addedByUserId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "zlayers" INTEGER NOT NULL DEFAULT 2147483647,

    CONSTRAINT "MapAreaLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "featuredImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideTag" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loadout" (
    "id" TEXT NOT NULL,
    "uuid" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "profileData" JSONB,
    "loadoutData" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loadout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "action" TEXT NOT NULL,
    "actionAr" TEXT NOT NULL,
    "userId" TEXT,
    "targetUserId" TEXT,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newListings" INTEGER NOT NULL DEFAULT 0,
    "completedTrades" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "newGuides" INTEGER NOT NULL DEFAULT 0,
    "newMapMarkers" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapConfiguration" (
    "id" TEXT NOT NULL,
    "mapID" TEXT NOT NULL,
    "centerLat" DOUBLE PRECISION NOT NULL,
    "centerLng" DOUBLE PRECISION NOT NULL,
    "zoom" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapRegion" (
    "id" TEXT NOT NULL,
    "mapID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT,
    "coordinates" JSONB NOT NULL,
    "fillColor" TEXT NOT NULL DEFAULT '#ff0000',
    "fillOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "strokeColor" TEXT NOT NULL DEFAULT '#ff0000',
    "strokeWeight" INTEGER NOT NULL DEFAULT 2,
    "addedByUserId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapRoute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mapID" TEXT NOT NULL,
    "routeNumber" INTEGER NOT NULL,
    "name" TEXT,
    "nameAr" TEXT,
    "coordinates" JSONB NOT NULL,
    "color" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" "SettingValueType" NOT NULL DEFAULT 'STRING',
    "category" "SettingCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "description" TEXT,
    "descriptionAr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_lastActivityAt_idx" ON "User"("lastActivityAt");

-- CreateIndex
CREATE INDEX "User_lastLoginAt_idx" ON "User"("lastLoginAt");

-- CreateIndex
CREATE INDEX "User_email_banned_idx" ON "User"("email", "banned");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_banned_idx" ON "User"("banned");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "Item_item_type_idx" ON "Item"("item_type");

-- CreateIndex
CREATE INDEX "Item_rarity_idx" ON "Item"("rarity");

-- CreateIndex
CREATE INDEX "Item_workbench_idx" ON "Item"("workbench");

-- CreateIndex
CREATE INDEX "Item_loot_area_idx" ON "Item"("loot_area");

-- CreateIndex
CREATE INDEX "Item_item_type_rarity_idx" ON "Item"("item_type", "rarity");

-- CreateIndex
CREATE INDEX "Item_workbench_item_type_idx" ON "Item"("workbench", "item_type");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Comment_itemId_idx" ON "Comment"("itemId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_created_at_idx" ON "Comment"("created_at");

-- CreateIndex
CREATE INDEX "Listing_userId_idx" ON "Listing"("userId");

-- CreateIndex
CREATE INDEX "Listing_itemId_idx" ON "Listing"("itemId");

-- CreateIndex
CREATE INDEX "Listing_type_idx" ON "Listing"("type");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_created_at_idx" ON "Listing"("created_at");

-- CreateIndex
CREATE INDEX "Listing_status_created_at_idx" ON "Listing"("status", "created_at");

-- CreateIndex
CREATE INDEX "Listing_type_status_idx" ON "Listing"("type", "status");

-- CreateIndex
CREATE INDEX "Listing_activeTraderChatId_idx" ON "Listing"("activeTraderChatId");

-- CreateIndex
CREATE INDEX "ListingItem_listingId_idx" ON "ListingItem"("listingId");

-- CreateIndex
CREATE INDEX "ListingItem_itemId_idx" ON "ListingItem"("itemId");

-- CreateIndex
CREATE INDEX "ListingItem_listingId_itemId_idx" ON "ListingItem"("listingId", "itemId");

-- CreateIndex
CREATE INDEX "Trade_listingId_idx" ON "Trade"("listingId");

-- CreateIndex
CREATE INDEX "Trade_buyerId_idx" ON "Trade"("buyerId");

-- CreateIndex
CREATE INDEX "Trade_sellerId_idx" ON "Trade"("sellerId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_tradeId_key" ON "Rating"("tradeId");

-- CreateIndex
CREATE INDEX "Rating_fromUserId_idx" ON "Rating"("fromUserId");

-- CreateIndex
CREATE INDEX "Rating_toUserId_idx" ON "Rating"("toUserId");

-- CreateIndex
CREATE INDEX "Rating_tradeId_idx" ON "Rating"("tradeId");

-- CreateIndex
CREATE INDEX "Rating_toUserId_honest_idx" ON "Rating"("toUserId", "honest");

-- CreateIndex
CREATE INDEX "Chat_listingId_idx" ON "Chat"("listingId");

-- CreateIndex
CREATE INDEX "Chat_participant1Id_idx" ON "Chat"("participant1Id");

-- CreateIndex
CREATE INDEX "Chat_participant2Id_idx" ON "Chat"("participant2Id");

-- CreateIndex
CREATE INDEX "Chat_status_idx" ON "Chat"("status");

-- CreateIndex
CREATE INDEX "Chat_participant1Id_status_idx" ON "Chat"("participant1Id", "status");

-- CreateIndex
CREATE INDEX "Chat_participant2Id_status_idx" ON "Chat"("participant2Id", "status");

-- CreateIndex
CREATE INDEX "Chat_listingId_status_idx" ON "Chat"("listingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_listingId_participant1Id_participant2Id_key" ON "Chat"("listingId", "participant1Id", "participant2Id");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_created_at_idx" ON "Message"("created_at");

-- CreateIndex
CREATE INDEX "Message_chatId_created_at_idx" ON "Message"("chatId", "created_at");

-- CreateIndex
CREATE INDEX "Arc_name_idx" ON "Arc"("name");

-- CreateIndex
CREATE INDEX "ArcLoot_arcId_idx" ON "ArcLoot"("arcId");

-- CreateIndex
CREATE INDEX "ArcLoot_itemId_idx" ON "ArcLoot"("itemId");

-- CreateIndex
CREATE INDEX "Quest_name_idx" ON "Quest"("name");

-- CreateIndex
CREATE INDEX "QuestReward_questId_idx" ON "QuestReward"("questId");

-- CreateIndex
CREATE INDEX "QuestReward_itemId_idx" ON "QuestReward"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkbenchPlanner_name_key" ON "WorkbenchPlanner"("name");

-- CreateIndex
CREATE INDEX "WorkbenchPlanner_name_idx" ON "WorkbenchPlanner"("name");

-- CreateIndex
CREATE INDEX "WorkbenchPlanner_type_idx" ON "WorkbenchPlanner"("type");

-- CreateIndex
CREATE INDEX "WorkbenchPlannerLevel_workbenchId_idx" ON "WorkbenchPlannerLevel"("workbenchId");

-- CreateIndex
CREATE INDEX "WorkbenchPlannerLevel_level_idx" ON "WorkbenchPlannerLevel"("level");

-- CreateIndex
CREATE UNIQUE INDEX "WorkbenchPlannerLevel_workbenchId_level_key" ON "WorkbenchPlannerLevel"("workbenchId", "level");

-- CreateIndex
CREATE INDEX "WorkbenchPlannerRequirement_workbenchLevelId_idx" ON "WorkbenchPlannerRequirement"("workbenchLevelId");

-- CreateIndex
CREATE INDEX "WorkbenchPlannerRequirement_itemName_idx" ON "WorkbenchPlannerRequirement"("itemName");

-- CreateIndex
CREATE INDEX "WorkbenchPlannerCraft_workbenchLevelId_idx" ON "WorkbenchPlannerCraft"("workbenchLevelId");

-- CreateIndex
CREATE INDEX "WorkbenchPlannerCraft_itemName_idx" ON "WorkbenchPlannerCraft"("itemName");

-- CreateIndex
CREATE INDEX "BlueprintLocationVote_blueprintId_idx" ON "BlueprintLocationVote"("blueprintId");

-- CreateIndex
CREATE INDEX "BlueprintLocationVote_blueprintId_category_idx" ON "BlueprintLocationVote"("blueprintId", "category");

-- CreateIndex
CREATE INDEX "BlueprintLocationVote_locationName_idx" ON "BlueprintLocationVote"("locationName");

-- CreateIndex
CREATE UNIQUE INDEX "BlueprintLocationVote_blueprintId_locationName_userIp_key" ON "BlueprintLocationVote"("blueprintId", "locationName", "userIp");

-- CreateIndex
CREATE INDEX "MapMarker_mapID_idx" ON "MapMarker"("mapID");

-- CreateIndex
CREATE INDEX "MapMarker_category_idx" ON "MapMarker"("category");

-- CreateIndex
CREATE INDEX "MapMarker_subcategory_idx" ON "MapMarker"("subcategory");

-- CreateIndex
CREATE INDEX "MapMarker_addedByUserId_idx" ON "MapMarker"("addedByUserId");

-- CreateIndex
CREATE INDEX "MapAreaLabel_mapID_idx" ON "MapAreaLabel"("mapID");

-- CreateIndex
CREATE INDEX "MapAreaLabel_zlayers_idx" ON "MapAreaLabel"("zlayers");

-- CreateIndex
CREATE INDEX "MapAreaLabel_addedByUserId_idx" ON "MapAreaLabel"("addedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE INDEX "BlogCategory_slug_idx" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_authorId_idx" ON "Blog"("authorId");

-- CreateIndex
CREATE INDEX "Blog_categoryId_idx" ON "Blog"("categoryId");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");

-- CreateIndex
CREATE INDEX "Blog_published_idx" ON "Blog"("published");

-- CreateIndex
CREATE INDEX "Blog_created_at_idx" ON "Blog"("created_at");

-- CreateIndex
CREATE INDEX "Blog_publishedAt_idx" ON "Blog"("publishedAt");

-- CreateIndex
CREATE INDEX "BlogComment_blogId_idx" ON "BlogComment"("blogId");

-- CreateIndex
CREATE INDEX "BlogComment_userId_idx" ON "BlogComment"("userId");

-- CreateIndex
CREATE INDEX "BlogComment_parentId_idx" ON "BlogComment"("parentId");

-- CreateIndex
CREATE INDEX "BlogComment_created_at_idx" ON "BlogComment"("created_at");

-- CreateIndex
CREATE INDEX "BlogTag_blogId_idx" ON "BlogTag"("blogId");

-- CreateIndex
CREATE INDEX "BlogTag_tag_idx" ON "BlogTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_blogId_tag_key" ON "BlogTag"("blogId", "tag");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "GuideCategory_name_key" ON "GuideCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuideCategory_slug_key" ON "GuideCategory"("slug");

-- CreateIndex
CREATE INDEX "GuideCategory_slug_idx" ON "GuideCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "Guide_authorId_idx" ON "Guide"("authorId");

-- CreateIndex
CREATE INDEX "Guide_categoryId_idx" ON "Guide"("categoryId");

-- CreateIndex
CREATE INDEX "Guide_slug_idx" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "Guide_published_idx" ON "Guide"("published");

-- CreateIndex
CREATE INDEX "Guide_created_at_idx" ON "Guide"("created_at");

-- CreateIndex
CREATE INDEX "Guide_publishedAt_idx" ON "Guide"("publishedAt");

-- CreateIndex
CREATE INDEX "GuideTag_guideId_idx" ON "GuideTag"("guideId");

-- CreateIndex
CREATE INDEX "GuideTag_tag_idx" ON "GuideTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "GuideTag_guideId_tag_key" ON "GuideTag"("guideId", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "Loadout_uuid_key" ON "Loadout"("uuid");

-- CreateIndex
CREATE INDEX "Loadout_userId_idx" ON "Loadout"("userId");

-- CreateIndex
CREATE INDEX "Loadout_is_public_idx" ON "Loadout"("is_public");

-- CreateIndex
CREATE INDEX "Loadout_created_at_idx" ON "Loadout"("created_at");

-- CreateIndex
CREATE INDEX "Loadout_name_idx" ON "Loadout"("name");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_targetUserId_idx" ON "ActivityLog"("targetUserId");

-- CreateIndex
CREATE INDEX "ActivityLog_type_idx" ON "ActivityLog"("type");

-- CreateIndex
CREATE INDEX "ActivityLog_created_at_idx" ON "ActivityLog"("created_at");

-- CreateIndex
CREATE INDEX "ActivityLog_relatedEntityType_relatedEntityId_idx" ON "ActivityLog"("relatedEntityType", "relatedEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");

-- CreateIndex
CREATE INDEX "DailyStats_date_idx" ON "DailyStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MapConfiguration_mapID_key" ON "MapConfiguration"("mapID");

-- CreateIndex
CREATE INDEX "MapConfiguration_mapID_idx" ON "MapConfiguration"("mapID");

-- CreateIndex
CREATE INDEX "MapRegion_mapID_idx" ON "MapRegion"("mapID");

-- CreateIndex
CREATE INDEX "MapRegion_addedByUserId_idx" ON "MapRegion"("addedByUserId");

-- CreateIndex
CREATE INDEX "MapRoute_userId_mapID_idx" ON "MapRoute"("userId", "mapID");

-- CreateIndex
CREATE INDEX "MapRoute_userId_mapID_visible_idx" ON "MapRoute"("userId", "mapID", "visible");

-- CreateIndex
CREATE UNIQUE INDEX "MapRoute_userId_mapID_routeNumber_key" ON "MapRoute"("userId", "mapID", "routeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "SiteSetting_category_idx" ON "SiteSetting"("category");

-- CreateIndex
CREATE INDEX "SiteSetting_key_idx" ON "SiteSetting"("key");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingItem" ADD CONSTRAINT "ListingItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingItem" ADD CONSTRAINT "ListingItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcLoot" ADD CONSTRAINT "ArcLoot_arcId_fkey" FOREIGN KEY ("arcId") REFERENCES "Arc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArcLoot" ADD CONSTRAINT "ArcLoot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestReward" ADD CONSTRAINT "QuestReward_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchPlannerLevel" ADD CONSTRAINT "WorkbenchPlannerLevel_workbenchId_fkey" FOREIGN KEY ("workbenchId") REFERENCES "WorkbenchPlanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchPlannerRequirement" ADD CONSTRAINT "WorkbenchPlannerRequirement_workbenchLevelId_fkey" FOREIGN KEY ("workbenchLevelId") REFERENCES "WorkbenchPlannerLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchPlannerCraft" ADD CONSTRAINT "WorkbenchPlannerCraft_workbenchLevelId_fkey" FOREIGN KEY ("workbenchLevelId") REFERENCES "WorkbenchPlannerLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapMarker" ADD CONSTRAINT "MapMarker_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapAreaLabel" ADD CONSTRAINT "MapAreaLabel_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogComment" ADD CONSTRAINT "BlogComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogTag" ADD CONSTRAINT "BlogTag_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GuideCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideTag" ADD CONSTRAINT "GuideTag_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loadout" ADD CONSTRAINT "Loadout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRegion" ADD CONSTRAINT "MapRegion_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRoute" ADD CONSTRAINT "MapRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

