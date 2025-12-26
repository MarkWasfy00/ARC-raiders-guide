export type SkillCategory = "conditioning" | "mobility" | "survival";

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  prerequisites: string[];
  position: { x: number; y: number };
}

export const CATEGORY_COLORS: Record<
  SkillCategory,
  { primary: string; muted: string; bg: string }
> = {
  conditioning: {
    primary: "hsl(142, 70%, 50%)",
    muted: "hsl(142, 45%, 38%)",
    bg: "hsl(142, 40%, 12%)",
  },
  mobility: {
    primary: "hsl(190, 85%, 55%)",
    muted: "hsl(190, 60%, 40%)",
    bg: "hsl(190, 50%, 12%)",
  },
  survival: {
    primary: "hsl(0, 75%, 52%)",
    muted: "hsl(0, 55%, 40%)",
    bg: "hsl(0, 45%, 12%)",
  },
};

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  conditioning: "Conditioning",
  mobility: "Mobility",
  survival: "Survival",
};

export const MOCK_SKILLS: Skill[] = [
  {
    id: "used-to-the-weight",
    name: "Used to the Weight",
    description:
      "Wearing a shield does not slow you down as much. Reduces movement penalty from heavy equipment.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: [],
    position: { x: -139, y: 80 },
  },
  {
    id: "blast-born",
    name: "Blast-Born",
    description:
      "Reduces damage taken from explosions and increases resistance to knockback effects.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: ["used-to-the-weight"],
    position: { x: -272, y: 88 },
  },
  {
    id: "survivors-stamina",
    name: "Survivor's Stamina",
    description:
      "Faster stamina regeneration when your health is low. The lower your health, the faster you recover.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["used-to-the-weight"],
    position: { x: -212, y: 192 },
  },
  {
    id: "iron-lungs",
    name: "Iron Lungs",
    description:
      "Increases maximum stamina capacity and reduces stamina drain while sprinting.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: ["blast-born"],
    position: { x: -391, y: 122 },
  },
  {
    id: "thick-skinned",
    name: "Thick Skinned",
    description:
      "Reduces damage from environmental hazards and status effects.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["blast-born", "survivors-stamina"],
    position: { x: -346, y: 200 },
  },
  {
    id: "last-stand",
    name: "Last Stand",
    description:
      "When health drops below 25%, gain increased damage resistance for a short duration.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["survivors-stamina"],
    position: { x: -301, y: 278 },
  },
  {
    id: "endurance-master",
    name: "Endurance Master",
    description:
      "Significantly reduces all stamina costs and increases recovery speed.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: ["iron-lungs", "thick-skinned"],
    position: { x: -480, y: 208 },
  },
  {
    id: "pain-tolerance",
    name: "Pain Tolerance",
    description:
      "Reduces flinch duration when taking damage and maintains aim stability.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["thick-skinned", "last-stand"],
    position: { x: -420, y: 312 },
  },
  {
    id: "marathon-runner",
    name: "Marathon Runner",
    description:
      "Increases base movement speed and sprint duration before stamina depletion.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: [],
    position: { x: 0, y: -160 },
  },
  {
    id: "carry-the-momentum",
    name: "Carry the Momentum",
    description:
      "After a dodge roll, sprint for free for a short duration without stamina cost.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["marathon-runner"],
    position: { x: -60, y: -280 },
  },
  {
    id: "nimble-climber",
    name: "Nimble Climber",
    description:
      "Climb and vault over obstacles faster. Reduces stamina cost of climbing.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: ["marathon-runner"],
    position: { x: 60, y: -280 },
  },
  {
    id: "quick-recovery",
    name: "Quick Recovery",
    description: "Reduces recovery time after being knocked down or staggered.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["carry-the-momentum"],
    position: { x: -90, y: -400 },
  },
  {
    id: "acrobat",
    name: "Acrobat",
    description:
      "Unlocks additional dodge maneuvers and reduces dodge stamina cost.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: ["carry-the-momentum", "nimble-climber"],
    position: { x: 0, y: -400 },
  },
  {
    id: "wall-runner",
    name: "Wall Runner",
    description:
      "Enables short wall runs and improves lateral movement on surfaces.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["nimble-climber"],
    position: { x: 90, y: -400 },
  },
  {
    id: "ghost-step",
    name: "Ghost Step",
    description:
      "Movement produces less noise, making it harder for enemies to detect you.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["quick-recovery", "acrobat"],
    position: { x: -70, y: -520 },
  },
  {
    id: "parkour-master",
    name: "Parkour Master",
    description:
      "Combines all mobility benefits. Maximum speed and agility in all situations.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: ["acrobat", "wall-runner"],
    position: { x: 70, y: -520 },
  },
  {
    id: "in-round-crafting",
    name: "In-Round Crafting",
    description: "Craft basic items during raids without needing a workbench.",
    category: "survival",
    maxLevel: 3,
    prerequisites: [],
    position: { x: 139, y: 80 },
  },
  {
    id: "security-breach",
    name: "Security Breach",
    description:
      "Unlock high-tier loot containers that are normally inaccessible.",
    category: "survival",
    maxLevel: 1,
    prerequisites: ["in-round-crafting"],
    position: { x: 212, y: 192 },
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    description: "Detect and safely defuse enemy deployables and traps.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["in-round-crafting"],
    position: { x: 272, y: 88 },
  },
  {
    id: "scavenger",
    name: "Scavenger",
    description: "Find additional loot in containers and from defeated enemies.",
    category: "survival",
    maxLevel: 5,
    prerequisites: ["security-breach"],
    position: { x: 301, y: 278 },
  },
  {
    id: "field-medic",
    name: "Field Medic",
    description:
      "Heal faster and more efficiently. Medical items have increased effectiveness.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["security-breach", "minesweeper"],
    position: { x: 346, y: 200 },
  },
  {
    id: "trap-master",
    name: "Trap Master",
    description:
      "Place more effective traps and deployables. Increased trap damage and duration.",
    category: "survival",
    maxLevel: 5,
    prerequisites: ["minesweeper"],
    position: { x: 391, y: 122 },
  },
  {
    id: "resource-expert",
    name: "Resource Expert",
    description:
      "Craft items with fewer materials. Increased yield from resource nodes.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["scavenger", "field-medic"],
    position: { x: 420, y: 312 },
  },
  {
    id: "survival-instinct",
    name: "Survival Instinct",
    description:
      "Sense nearby threats and valuable loot through walls within a short range.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["field-medic", "trap-master"],
    position: { x: 480, y: 208 },
  },
];

export const ROOT_NODE = {
  id: "core",
  name: "Core",
  position: { x: 0, y: 0 },
};

export const SKILL_TREE_CENTER = { x: 550, y: 325 };
const BRANCH_SPACING_MULTIPLIER = 1;

export const mapTreePosition = (position: { x: number; y: number }) => {
  return { x: position.x, y: position.y };
};

export const mapSkillPosition = (skill: Skill) => {
  const multiplier = BRANCH_SPACING_MULTIPLIER;
  return mapTreePosition({
    x: skill.position.x * multiplier,
    y: skill.position.y * multiplier,
  });
};

const SKILL_TREE_MAX_DISTANCE = Math.max(
  ...MOCK_SKILLS.map((skill) => {
    const mapped = mapSkillPosition(skill);
    return Math.hypot(mapped.x - ROOT_NODE.position.x, mapped.y - ROOT_NODE.position.y);
  })
);
export const SKILL_TREE_RADIUS = SKILL_TREE_MAX_DISTANCE;

export const MAX_TOTAL_POINTS = 76;

export const KEY_SKILLS = [
  { name: "Survivor's Stamina", description: "Faster stamina regen when hurt" },
  { name: "Carry the Momentum", description: "Free sprinting after dodge rolls" },
  { name: "Security Breach", description: "Unlock high-tier loot" },
  { name: "Minesweeper", description: "Defuse deployables" },
  { name: "In-Round Crafting", description: "Craft during raids" },
];
