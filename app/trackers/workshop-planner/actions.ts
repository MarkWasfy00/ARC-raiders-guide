'use server';

import { prisma } from '@/lib/prisma';
import { Workbench } from '@/lib/generated/prisma/client';

export type WorkbenchRequirementItem = {
  itemName: string;
  quantity: number;
  item?: {
    id: string;
    name: string;
    icon: string | null;
    rarity: string | null;
  } | null;
};

export type WorkbenchCraftItem = {
  itemName: string;
  item?: {
    id: string;
    name: string;
    icon: string | null;
    rarity: string | null;
  } | null;
};

export type WorkbenchLevelData = {
  level: number;
  levelName: string | null;
  rates: string | null;
  requirements: WorkbenchRequirementItem[];
  crafts: WorkbenchCraftItem[];
};

export type WorkbenchPlannerData = {
  id: string;
  name: string;
  description: string | null;
  type: Workbench;
  levels: WorkbenchLevelData[];
};

export async function getWorkbenchItems(): Promise<WorkbenchPlannerData[]> {
  try {
    const workbenches = await prisma.workbenchPlanner.findMany({
      include: {
        levels: {
          include: {
            requirements: true,
            crafts: true,
          },
          orderBy: {
            level: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Enrich with item data
    const enrichedWorkbenches: WorkbenchPlannerData[] = [];

    for (const workbench of workbenches) {
      const enrichedLevels: WorkbenchLevelData[] = [];

      for (const level of workbench.levels) {
        // Fetch item data for requirements
        const enrichedRequirements: WorkbenchRequirementItem[] = [];
        for (const req of level.requirements) {
          const item = await prisma.item.findFirst({
            where: { name: req.itemName },
            select: {
              id: true,
              name: true,
              icon: true,
              rarity: true,
            },
          });

          enrichedRequirements.push({
            itemName: req.itemName,
            quantity: req.quantity,
            item: item || null,
          });
        }

        // Fetch item data for crafts
        const enrichedCrafts: WorkbenchCraftItem[] = [];
        for (const craft of level.crafts) {
          const item = await prisma.item.findFirst({
            where: { name: craft.itemName },
            select: {
              id: true,
              name: true,
              icon: true,
              rarity: true,
            },
          });

          enrichedCrafts.push({
            itemName: craft.itemName,
            item: item || null,
          });
        }

        enrichedLevels.push({
          level: level.level,
          levelName: level.levelName,
          rates: level.rates,
          requirements: enrichedRequirements,
          crafts: enrichedCrafts,
        });
      }

      enrichedWorkbenches.push({
        id: workbench.id,
        name: workbench.name,
        description: workbench.description,
        type: workbench.type,
        levels: enrichedLevels,
      });
    }

    return enrichedWorkbenches;
  } catch (error) {
    console.error('Error fetching workbench planner data:', error);
    return [];
  }
}
