-- AlterTable
ALTER TABLE "MapAreaLabel" ADD COLUMN     "zlayers" INTEGER NOT NULL DEFAULT 2147483647;

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

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

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
CREATE INDEX "Chat_participant1Id_status_idx" ON "Chat"("participant1Id", "status");

-- CreateIndex
CREATE INDEX "Chat_participant2Id_status_idx" ON "Chat"("participant2Id", "status");

-- CreateIndex
CREATE INDEX "Item_item_type_rarity_idx" ON "Item"("item_type", "rarity");

-- CreateIndex
CREATE INDEX "Item_workbench_item_type_idx" ON "Item"("workbench", "item_type");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Listing_status_created_at_idx" ON "Listing"("status", "created_at");

-- CreateIndex
CREATE INDEX "Listing_type_status_idx" ON "Listing"("type", "status");

-- CreateIndex
CREATE INDEX "ListingItem_listingId_itemId_idx" ON "ListingItem"("listingId", "itemId");

-- CreateIndex
CREATE INDEX "MapAreaLabel_zlayers_idx" ON "MapAreaLabel"("zlayers");

-- CreateIndex
CREATE INDEX "Message_chatId_created_at_idx" ON "Message"("chatId", "created_at");

-- CreateIndex
CREATE INDEX "Rating_toUserId_honest_idx" ON "Rating"("toUserId", "honest");

-- CreateIndex
CREATE INDEX "User_email_banned_idx" ON "User"("email", "banned");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_banned_idx" ON "User"("banned");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "MapRegion" ADD CONSTRAINT "MapRegion_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRoute" ADD CONSTRAINT "MapRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
