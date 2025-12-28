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

    // Collect all unique item names
    const allItemNames = new Set<string>();
    for (const workbench of workbenches) {
      for (const level of workbench.levels) {
        for (const req of level.requirements) {
          allItemNames.add(req.itemName);
        }
        for (const craft of level.crafts) {
          allItemNames.add(craft.itemName);
        }
      }
    }

    // Fetch all items in a single query
    const items = await prisma.item.findMany({
      where: {
        name: {
          in: Array.from(allItemNames),
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        rarity: true,
      },
    });

    // Create a lookup map for fast access
    const itemMap = new Map(items.map(item => [item.name, item]));

    // Enrich with item data
    const enrichedWorkbenches: WorkbenchPlannerData[] = [];

    for (const workbench of workbenches) {
      const enrichedLevels: WorkbenchLevelData[] = [];

      for (const level of workbench.levels) {
        // Enrich requirements with item data
        const enrichedRequirements: WorkbenchRequirementItem[] = level.requirements.map(req => ({
          itemName: req.itemName,
          quantity: req.quantity,
          item: itemMap.get(req.itemName) || null,
        }));

        // Enrich crafts with item data
        const enrichedCrafts: WorkbenchCraftItem[] = level.crafts.map(craft => ({
          itemName: craft.itemName,
          item: itemMap.get(craft.itemName) || null,
        }));

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
