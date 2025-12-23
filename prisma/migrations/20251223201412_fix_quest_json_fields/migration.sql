-- AlterTable: Convert locations and guide_links from TEXT[] to JSONB
ALTER TABLE "Quest" DROP COLUMN "locations";
ALTER TABLE "Quest" ADD COLUMN "locations" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "Quest" DROP COLUMN "guide_links";
ALTER TABLE "Quest" ADD COLUMN "guide_links" JSONB NOT NULL DEFAULT '[]';
