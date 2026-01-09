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

    CONSTRAINT "MapAreaLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MapAreaLabel_mapID_idx" ON "MapAreaLabel"("mapID");

-- CreateIndex
CREATE INDEX "MapAreaLabel_addedByUserId_idx" ON "MapAreaLabel"("addedByUserId");

-- AddForeignKey
ALTER TABLE "MapAreaLabel" ADD CONSTRAINT "MapAreaLabel_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
