-- AlterEnum
ALTER TYPE "Workbench" ADD VALUE 'WORKBENCH';

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

-- AddForeignKey
ALTER TABLE "WorkbenchPlannerLevel" ADD CONSTRAINT "WorkbenchPlannerLevel_workbenchId_fkey" FOREIGN KEY ("workbenchId") REFERENCES "WorkbenchPlanner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchPlannerRequirement" ADD CONSTRAINT "WorkbenchPlannerRequirement_workbenchLevelId_fkey" FOREIGN KEY ("workbenchLevelId") REFERENCES "WorkbenchPlannerLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkbenchPlannerCraft" ADD CONSTRAINT "WorkbenchPlannerCraft_workbenchLevelId_fkey" FOREIGN KEY ("workbenchLevelId") REFERENCES "WorkbenchPlannerLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
