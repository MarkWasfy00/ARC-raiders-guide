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
    primary: "hsl(142, 71%, 45%)",
    muted: "hsl(142, 40%, 35%)",
    bg: "hsl(142, 40%, 12%)",
  },
  mobility: {
    primary: "hsl(46, 100%, 62%)",
    muted: "hsl(46, 70%, 45%)",
    bg: "hsl(46, 60%, 12%)",
  },
  survival: {
    primary: "hsl(0, 72%, 51%)",
    muted: "hsl(0, 55%, 42%)",
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
    position: { x: -300, y: 0 },
  },
  {
    id: "blast-born",
    name: "Blast-Born",
    description:
      "Reduces damage taken from explosions and increases resistance to knockback effects.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: ["used-to-the-weight"],
    position: { x: -350, y: 100 },
  },
  {
    id: "survivors-stamina",
    name: "Survivor's Stamina",
    description:
      "Faster stamina regeneration when your health is low. The lower your health, the faster you recover.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["used-to-the-weight"],
    position: { x: -250, y: 100 },
  },
  {
    id: "iron-lungs",
    name: "Iron Lungs",
    description:
      "Increases maximum stamina capacity and reduces stamina drain while sprinting.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: ["blast-born"],
    position: { x: -400, y: 200 },
  },
  {
    id: "thick-skinned",
    name: "Thick Skinned",
    description:
      "Reduces damage from environmental hazards and status effects.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["blast-born", "survivors-stamina"],
    position: { x: -300, y: 200 },
  },
  {
    id: "last-stand",
    name: "Last Stand",
    description:
      "When health drops below 25%, gain increased damage resistance for a short duration.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["survivors-stamina"],
    position: { x: -200, y: 200 },
  },
  {
    id: "endurance-master",
    name: "Endurance Master",
    description:
      "Significantly reduces all stamina costs and increases recovery speed.",
    category: "conditioning",
    maxLevel: 5,
    prerequisites: ["iron-lungs", "thick-skinned"],
    position: { x: -350, y: 300 },
  },
  {
    id: "pain-tolerance",
    name: "Pain Tolerance",
    description:
      "Reduces flinch duration when taking damage and maintains aim stability.",
    category: "conditioning",
    maxLevel: 3,
    prerequisites: ["thick-skinned", "last-stand"],
    position: { x: -250, y: 300 },
  },
  {
    id: "marathon-runner",
    name: "Marathon Runner",
    description:
      "Increases base movement speed and sprint duration before stamina depletion.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: [],
    position: { x: 0, y: 0 },
  },
  {
    id: "carry-the-momentum",
    name: "Carry the Momentum",
    description:
      "After a dodge roll, sprint for free for a short duration without stamina cost.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["marathon-runner"],
    position: { x: -50, y: 100 },
  },
  {
    id: "nimble-climber",
    name: "Nimble Climber",
    description:
      "Climb and vault over obstacles faster. Reduces stamina cost of climbing.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: ["marathon-runner"],
    position: { x: 50, y: 100 },
  },
  {
    id: "quick-recovery",
    name: "Quick Recovery",
    description: "Reduces recovery time after being knocked down or staggered.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["carry-the-momentum"],
    position: { x: -100, y: 200 },
  },
  {
    id: "acrobat",
    name: "Acrobat",
    description:
      "Unlocks additional dodge maneuvers and reduces dodge stamina cost.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: ["carry-the-momentum", "nimble-climber"],
    position: { x: 0, y: 200 },
  },
  {
    id: "wall-runner",
    name: "Wall Runner",
    description:
      "Enables short wall runs and improves lateral movement on surfaces.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["nimble-climber"],
    position: { x: 100, y: 200 },
  },
  {
    id: "ghost-step",
    name: "Ghost Step",
    description:
      "Movement produces less noise, making it harder for enemies to detect you.",
    category: "mobility",
    maxLevel: 3,
    prerequisites: ["quick-recovery", "acrobat"],
    position: { x: -50, y: 300 },
  },
  {
    id: "parkour-master",
    name: "Parkour Master",
    description:
      "Combines all mobility benefits. Maximum speed and agility in all situations.",
    category: "mobility",
    maxLevel: 5,
    prerequisites: ["acrobat", "wall-runner"],
    position: { x: 50, y: 300 },
  },
  {
    id: "in-round-crafting",
    name: "In-Round Crafting",
    description: "Craft basic items during raids without needing a workbench.",
    category: "survival",
    maxLevel: 3,
    prerequisites: [],
    position: { x: 300, y: 0 },
  },
  {
    id: "security-breach",
    name: "Security Breach",
    description:
      "Unlock high-tier loot containers that are normally inaccessible.",
    category: "survival",
    maxLevel: 1,
    prerequisites: ["in-round-crafting"],
    position: { x: 250, y: 100 },
  },
  {
    id: "minesweeper",
    name: "Minesweeper",
    description: "Detect and safely defuse enemy deployables and traps.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["in-round-crafting"],
    position: { x: 350, y: 100 },
  },
  {
    id: "scavenger",
    name: "Scavenger",
    description: "Find additional loot in containers and from defeated enemies.",
    category: "survival",
    maxLevel: 5,
    prerequisites: ["security-breach"],
    position: { x: 200, y: 200 },
  },
  {
    id: "field-medic",
    name: "Field Medic",
    description:
      "Heal faster and more efficiently. Medical items have increased effectiveness.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["security-breach", "minesweeper"],
    position: { x: 300, y: 200 },
  },
  {
    id: "trap-master",
    name: "Trap Master",
    description:
      "Place more effective traps and deployables. Increased trap damage and duration.",
    category: "survival",
    maxLevel: 5,
    prerequisites: ["minesweeper"],
    position: { x: 400, y: 200 },
  },
  {
    id: "resource-expert",
    name: "Resource Expert",
    description:
      "Craft items with fewer materials. Increased yield from resource nodes.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["scavenger", "field-medic"],
    position: { x: 250, y: 300 },
  },
  {
    id: "survival-instinct",
    name: "Survival Instinct",
    description:
      "Sense nearby threats and valuable loot through walls within a short range.",
    category: "survival",
    maxLevel: 3,
    prerequisites: ["field-medic", "trap-master"],
    position: { x: 350, y: 300 },
  },
];

const POSITION_Y_MAX = Math.max(...MOCK_SKILLS.map((skill) => skill.position.y));

export const mapSkillPosition = (skill: Skill) => {
  const mappedX = skill.position.x;
  const mappedY = POSITION_Y_MAX - skill.position.y;

  return { x: mappedX, y: mappedY };
};

export const MAX_TOTAL_POINTS = 76;

export const KEY_SKILLS = [
  { name: "Survivor's Stamina", description: "Faster stamina regen when hurt" },
  { name: "Carry the Momentum", description: "Free sprinting after dodge rolls" },
  { name: "Security Breach", description: "Unlock high-tier loot" },
  { name: "Minesweeper", description: "Defuse deployables" },
  { name: "In-Round Crafting", description: "Craft during raids" },
];
