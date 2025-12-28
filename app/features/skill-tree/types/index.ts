export type SkillBranch = 'conditioning' | 'mobility' | 'survival';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  branch: SkillBranch;
  tier: number;
  cost: number;
  expeditionPointCost: number;
  position: { x: number; y: number };
  prerequisites: string[];
  icon?: string;
}

export interface SkillTreeState {
  unlockedSkills: Set<string>;
  totalPoints: number;
  expeditionPoints: number;
  maxPoints: number;
  maxExpeditionPoints: number;
}

export interface SkillBuild {
  id?: string;
  userId?: string;
  name: string;
  description?: string;
  unlockedSkills: string[];
  expeditionPoints: number;
  shareCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
