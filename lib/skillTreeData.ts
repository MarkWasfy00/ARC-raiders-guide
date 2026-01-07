export type SkillCategory = 'conditioning' | 'mobility' | 'survival';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  prerequisites: string[];
  tier: 1 | 2 | 3;
  position: { x: number; y: number };
}

// Colors match the reference: Conditioning=Green, Mobility=Yellow, Survival=Red
export const CATEGORY_COLORS: Record<SkillCategory, { primary: string; muted: string; bg: string }> = {
  conditioning: {
    primary: 'hsl(142, 71%, 45%)',
    muted: 'hsl(142, 40%, 35%)',
    bg: 'hsl(142, 40%, 12%)',
  },
  mobility: {
    primary: 'hsl(45, 93%, 47%)',
    muted: 'hsl(45, 60%, 40%)',
    bg: 'hsl(45, 50%, 12%)',
  },
  survival: {
    primary: 'hsl(0, 72%, 51%)',
    muted: 'hsl(0, 40%, 40%)',
    bg: 'hsl(0, 40%, 12%)',
  },
};

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  conditioning: 'CONDITIONING',
  mobility: 'MOBILITY',
  survival: 'SURVIVAL',
};

export const TIER_REQUIREMENTS = {
  tier2: 15,
  tier3: 36,
};

export const MAX_TOTAL_POINTS = 76;

// Canvas layout - adjusted for MetaForge-style layout
const CANVAS_CENTER_X = 700;
const ROOT_Y = 550;
const VERTICAL_SPACING = 55;
const HORIZONTAL_SPACING = 55;

// Conditioning branch (LEFT / GREEN) - spreads up-left
const conditioningPositions: Record<string, { x: number; y: number }> = {
  // Tier 1 - Root and initial branch
  'used-to-the-weight': { x: 580, y: ROOT_Y },
  'blast-born': { x: 520, y: ROOT_Y - VERTICAL_SPACING * 1.2 },
  'gentle-pressure': { x: 460, y: ROOT_Y - VERTICAL_SPACING * 2.2 },
  'proficient-pryer': { x: 540, y: ROOT_Y - VERTICAL_SPACING * 2.4 },
  'fight-or-flight': { x: 480, y: ROOT_Y - VERTICAL_SPACING * 3.2 },
  
  // Tier 2 - Spreads wider
  'survivors-stamina': { x: 400, y: ROOT_Y - VERTICAL_SPACING * 4 },
  'unburdened-roll': { x: 520, y: ROOT_Y - VERTICAL_SPACING * 4.2 },
  'a-little-extra': { x: 340, y: ROOT_Y - VERTICAL_SPACING * 5 },
  'effortless-swing': { x: 440, y: ROOT_Y - VERTICAL_SPACING * 5.2 },
  'downed-but-determined': { x: 360, y: ROOT_Y - VERTICAL_SPACING * 6 },
  'turtle-crawl': { x: 480, y: ROOT_Y - VERTICAL_SPACING * 6 },
  'loaded-arms': { x: 300, y: ROOT_Y - VERTICAL_SPACING * 7 },
  'sky-clearing-swing': { x: 400, y: ROOT_Y - VERTICAL_SPACING * 7 },
  
  // Tier 3 - Top capstones
  'back-on-your-feet': { x: 280, y: ROOT_Y - VERTICAL_SPACING * 8 },
  'flyswatter': { x: 350, y: ROOT_Y - VERTICAL_SPACING * 8.5 },
};

// Mobility branch (CENTER / YELLOW) - goes straight up with slight spread
const mobilityPositions: Record<string, { x: number; y: number }> = {
  // Tier 1
  'nimble-climber': { x: CANVAS_CENTER_X, y: ROOT_Y },
  'marathon-runner': { x: CANVAS_CENTER_X - 35, y: ROOT_Y - VERTICAL_SPACING * 1.2 },
  'slip-and-slide': { x: CANVAS_CENTER_X + 35, y: ROOT_Y - VERTICAL_SPACING * 1.2 },
  'youthful-lungs': { x: CANVAS_CENTER_X - 50, y: ROOT_Y - VERTICAL_SPACING * 2.2 },
  'sturdy-ankles': { x: CANVAS_CENTER_X + 50, y: ROOT_Y - VERTICAL_SPACING * 2.2 },
  
  // Tier 2
  'carry-the-momentum': { x: CANVAS_CENTER_X - 70, y: ROOT_Y - VERTICAL_SPACING * 3.2 },
  'calming-stroll': { x: CANVAS_CENTER_X, y: ROOT_Y - VERTICAL_SPACING * 3.4 },
  'effortless-roll': { x: CANVAS_CENTER_X + 70, y: ROOT_Y - VERTICAL_SPACING * 3.2 },
  'heroic-leap': { x: CANVAS_CENTER_X - 50, y: ROOT_Y - VERTICAL_SPACING * 4.2 },
  'crawl-before-you-walk': { x: CANVAS_CENTER_X + 50, y: ROOT_Y - VERTICAL_SPACING * 4.2 },
  'vigorous-vaulter': { x: CANVAS_CENTER_X - 35, y: ROOT_Y - VERTICAL_SPACING * 5.2 },
  'off-the-wall': { x: CANVAS_CENTER_X + 35, y: ROOT_Y - VERTICAL_SPACING * 5.2 },
  'ready-to-roll': { x: CANVAS_CENTER_X, y: ROOT_Y - VERTICAL_SPACING * 6 },
  
  // Tier 3
  'vaults-on-vaults': { x: CANVAS_CENTER_X - 40, y: ROOT_Y - VERTICAL_SPACING * 7 },
  'vault-spring': { x: CANVAS_CENTER_X + 40, y: ROOT_Y - VERTICAL_SPACING * 7 },
};

// Survival branch (RIGHT / RED) - spreads up-right
const survivalPositions: Record<string, { x: number; y: number }> = {
  // Tier 1
  'agile-croucher': { x: 820, y: ROOT_Y },
  'looters-instincts': { x: 880, y: ROOT_Y - VERTICAL_SPACING * 1.2 },
  'revitalizing-squat': { x: 940, y: ROOT_Y - VERTICAL_SPACING * 2.2 },
  'silent-scavenger': { x: 860, y: ROOT_Y - VERTICAL_SPACING * 2.4 },
  'broad-shoulders': { x: 920, y: ROOT_Y - VERTICAL_SPACING * 3.2 },
  
  // Tier 2
  'suffer-in-silence': { x: 1000, y: ROOT_Y - VERTICAL_SPACING * 4 },
  'good-as-new': { x: 880, y: ROOT_Y - VERTICAL_SPACING * 4.2 },
  'in-round-crafting': { x: 960, y: ROOT_Y - VERTICAL_SPACING * 5.2 },
  'stubborn-mule': { x: 840, y: ROOT_Y - VERTICAL_SPACING * 5 },
  'looters-luck': { x: 1020, y: ROOT_Y - VERTICAL_SPACING * 6 },
  'one-raiders-scraps': { x: 900, y: ROOT_Y - VERTICAL_SPACING * 6 },
  'three-deep-breaths': { x: 1000, y: ROOT_Y - VERTICAL_SPACING * 7 },
  'traveling-tinkerer': { x: 860, y: ROOT_Y - VERTICAL_SPACING * 7 },
  
  // Tier 3
  'security-breach': { x: 1120, y: ROOT_Y - VERTICAL_SPACING * 5 },
  'minesweeper': { x: 1120, y: ROOT_Y - VERTICAL_SPACING * 6.5 },
};

export const MOCK_SKILLS: Skill[] = [
  // CONDITIONING (GREEN/LEFT)
  { id: 'used-to-the-weight', name: 'Used to the Weight', description: "Wearing a shield doesn't slow you down as much.", category: 'conditioning', maxLevel: 5, prerequisites: [], tier: 1, position: conditioningPositions['used-to-the-weight'] },
  { id: 'blast-born', name: 'Blast-Born', description: 'Your hearing is less affected by nearby explosions.', category: 'conditioning', maxLevel: 5, prerequisites: ['used-to-the-weight'], tier: 1, position: conditioningPositions['blast-born'] },
  { id: 'gentle-pressure', name: 'Gentle Pressure', description: 'You make less noise when breaching.', category: 'conditioning', maxLevel: 5, prerequisites: ['blast-born'], tier: 1, position: conditioningPositions['gentle-pressure'] },
  { id: 'proficient-pryer', name: 'Proficient Pryer', description: 'Breaching doors and containers takes less time.', category: 'conditioning', maxLevel: 5, prerequisites: ['blast-born'], tier: 1, position: conditioningPositions['proficient-pryer'] },
  { id: 'fight-or-flight', name: 'Fight or Flight', description: "When you're hurt in combat, regain a fixed amount of stamina.", category: 'conditioning', maxLevel: 5, prerequisites: ['gentle-pressure', 'proficient-pryer'], tier: 1, position: conditioningPositions['fight-or-flight'] },
  
  { id: 'survivors-stamina', name: "Survivor's Stamina", description: "When you're critically hurt, your stamina regenerates faster.", category: 'conditioning', maxLevel: 5, prerequisites: ['fight-or-flight'], tier: 2, position: conditioningPositions['survivors-stamina'] },
  { id: 'unburdened-roll', name: 'Unburdened Roll', description: 'If your shield breaks, your first Dodge Roll does not cost stamina.', category: 'conditioning', maxLevel: 5, prerequisites: ['fight-or-flight'], tier: 2, position: conditioningPositions['unburdened-roll'] },
  { id: 'a-little-extra', name: 'A Little Extra', description: 'Breaching an object generates resources.', category: 'conditioning', maxLevel: 5, prerequisites: ['survivors-stamina'], tier: 2, position: conditioningPositions['a-little-extra'] },
  { id: 'effortless-swing', name: 'Effortless Swing', description: 'Melee abilities cost less stamina.', category: 'conditioning', maxLevel: 5, prerequisites: ['survivors-stamina', 'unburdened-roll'], tier: 2, position: conditioningPositions['effortless-swing'] },
  { id: 'downed-but-determined', name: 'Downed But Determined', description: "When you're downed, it takes longer before you collapse.", category: 'conditioning', maxLevel: 5, prerequisites: ['a-little-extra', 'effortless-swing'], tier: 2, position: conditioningPositions['downed-but-determined'] },
  { id: 'turtle-crawl', name: 'Turtle Crawl', description: 'While downed, you take less damage.', category: 'conditioning', maxLevel: 5, prerequisites: ['effortless-swing'], tier: 2, position: conditioningPositions['turtle-crawl'] },
  { id: 'loaded-arms', name: 'Loaded Arms', description: 'Your equipped weapon has less impact on your encumbrance.', category: 'conditioning', maxLevel: 5, prerequisites: ['downed-but-determined'], tier: 2, position: conditioningPositions['loaded-arms'] },
  { id: 'sky-clearing-swing', name: 'Sky-Clearing Swing', description: 'You deal more melee damage to drones.', category: 'conditioning', maxLevel: 5, prerequisites: ['downed-but-determined', 'turtle-crawl'], tier: 2, position: conditioningPositions['sky-clearing-swing'] },
  
  { id: 'back-on-your-feet', name: 'Back On Your Feet', description: "When you're critically hurt, your health regenerates until a certain limit.", category: 'conditioning', maxLevel: 1, prerequisites: ['loaded-arms', 'sky-clearing-swing'], tier: 3, position: conditioningPositions['back-on-your-feet'] },
  { id: 'flyswatter', name: 'Flyswatter', description: 'Wasps and Turrets can be destroyed with a single melee attack.', category: 'conditioning', maxLevel: 1, prerequisites: ['back-on-your-feet'], tier: 3, position: conditioningPositions['flyswatter'] },

  // MOBILITY (YELLOW/CENTER)
  { id: 'nimble-climber', name: 'Nimble Climber', description: 'You can climb and vault more quickly.', category: 'mobility', maxLevel: 5, prerequisites: [], tier: 1, position: mobilityPositions['nimble-climber'] },
  { id: 'marathon-runner', name: 'Marathon Runner', description: 'Moving around costs less stamina.', category: 'mobility', maxLevel: 5, prerequisites: ['nimble-climber'], tier: 1, position: mobilityPositions['marathon-runner'] },
  { id: 'slip-and-slide', name: 'Slip and Slide', description: 'You can slide further and faster.', category: 'mobility', maxLevel: 5, prerequisites: ['nimble-climber'], tier: 1, position: mobilityPositions['slip-and-slide'] },
  { id: 'youthful-lungs', name: 'Youthful Lungs', description: 'Increases your max stamina.', category: 'mobility', maxLevel: 5, prerequisites: ['marathon-runner'], tier: 1, position: mobilityPositions['youthful-lungs'] },
  { id: 'sturdy-ankles', name: 'Sturdy Ankles', description: 'You take less fall damage when falling from a non-lethal height.', category: 'mobility', maxLevel: 5, prerequisites: ['slip-and-slide'], tier: 1, position: mobilityPositions['sturdy-ankles'] },
  
  { id: 'carry-the-momentum', name: 'Carry the Momentum', description: 'After a Sprint Dodge Roll, sprinting does not consume stamina briefly.', category: 'mobility', maxLevel: 5, prerequisites: ['youthful-lungs'], tier: 2, position: mobilityPositions['carry-the-momentum'] },
  { id: 'calming-stroll', name: 'Calming Stroll', description: 'While walking, your stamina regenerates as if you were standing still.', category: 'mobility', maxLevel: 5, prerequisites: ['youthful-lungs', 'sturdy-ankles'], tier: 2, position: mobilityPositions['calming-stroll'] },
  { id: 'effortless-roll', name: 'Effortless Roll', description: 'Dodge Rolls cost less stamina.', category: 'mobility', maxLevel: 5, prerequisites: ['sturdy-ankles'], tier: 2, position: mobilityPositions['effortless-roll'] },
  { id: 'heroic-leap', name: 'Heroic Leap', description: 'You can Sprint Dodge Roll further.', category: 'mobility', maxLevel: 5, prerequisites: ['carry-the-momentum', 'calming-stroll'], tier: 2, position: mobilityPositions['heroic-leap'] },
  { id: 'crawl-before-you-walk', name: 'Crawl Before You Walk', description: "When you're downed, you crawl faster.", category: 'mobility', maxLevel: 5, prerequisites: ['calming-stroll', 'effortless-roll'], tier: 2, position: mobilityPositions['crawl-before-you-walk'] },
  { id: 'vigorous-vaulter', name: 'Vigorous Vaulter', description: 'Vaulting is no longer slowed down while exhausted.', category: 'mobility', maxLevel: 5, prerequisites: ['heroic-leap'], tier: 2, position: mobilityPositions['vigorous-vaulter'] },
  { id: 'off-the-wall', name: 'Off the Wall', description: 'You can Wall Leap further.', category: 'mobility', maxLevel: 5, prerequisites: ['crawl-before-you-walk'], tier: 2, position: mobilityPositions['off-the-wall'] },
  { id: 'ready-to-roll', name: 'Ready to Roll', description: 'When falling, your timing window for a Recovery Roll is increased.', category: 'mobility', maxLevel: 5, prerequisites: ['vigorous-vaulter', 'off-the-wall'], tier: 2, position: mobilityPositions['ready-to-roll'] },
  
  { id: 'vaults-on-vaults', name: 'Vaults on Vaults on Vaults', description: 'Vaulting no longer costs stamina.', category: 'mobility', maxLevel: 1, prerequisites: ['ready-to-roll'], tier: 3, position: mobilityPositions['vaults-on-vaults'] },
  { id: 'vault-spring', name: 'Vault Spring', description: 'Lets you jump at the end of a vault.', category: 'mobility', maxLevel: 1, prerequisites: ['vaults-on-vaults'], tier: 3, position: mobilityPositions['vault-spring'] },

  // SURVIVAL (RED/RIGHT)
  { id: 'agile-croucher', name: 'Agile Croucher', description: 'Your movement speed while crouching is increased.', category: 'survival', maxLevel: 5, prerequisites: [], tier: 1, position: survivalPositions['agile-croucher'] },
  { id: 'looters-instincts', name: "Looter's Instincts", description: 'When searching a container, loot is revealed faster.', category: 'survival', maxLevel: 5, prerequisites: ['agile-croucher'], tier: 1, position: survivalPositions['looters-instincts'] },
  { id: 'revitalizing-squat', name: 'Revitalizing Squat', description: 'Stamina regeneration while crouched is increased.', category: 'survival', maxLevel: 5, prerequisites: ['looters-instincts'], tier: 1, position: survivalPositions['revitalizing-squat'] },
  { id: 'silent-scavenger', name: 'Silent Scavenger', description: 'You make less noise when looting.', category: 'survival', maxLevel: 5, prerequisites: ['looters-instincts'], tier: 1, position: survivalPositions['silent-scavenger'] },
  { id: 'broad-shoulders', name: 'Broad Shoulders', description: 'Your carrying capacity is increased.', category: 'survival', maxLevel: 5, prerequisites: ['revitalizing-squat', 'silent-scavenger'], tier: 1, position: survivalPositions['broad-shoulders'] },
  
  { id: 'suffer-in-silence', name: 'Suffer in Silence', description: 'You make less noise when hurt.', category: 'survival', maxLevel: 5, prerequisites: ['broad-shoulders'], tier: 2, position: survivalPositions['suffer-in-silence'] },
  { id: 'good-as-new', name: 'Good As New', description: 'Healing items are more effective.', category: 'survival', maxLevel: 5, prerequisites: ['broad-shoulders'], tier: 2, position: survivalPositions['good-as-new'] },
  { id: 'in-round-crafting', name: 'In-Round Crafting', description: 'You can craft certain items during raids.', category: 'survival', maxLevel: 3, prerequisites: ['suffer-in-silence', 'good-as-new'], tier: 2, position: survivalPositions['in-round-crafting'] },
  { id: 'stubborn-mule', name: 'Stubborn Mule', description: 'Movement speed penalty from carrying heavy loads is reduced.', category: 'survival', maxLevel: 5, prerequisites: ['good-as-new'], tier: 2, position: survivalPositions['stubborn-mule'] },
  { id: 'looters-luck', name: "Looter's Luck", description: 'Chance to find additional loot in containers.', category: 'survival', maxLevel: 5, prerequisites: ['in-round-crafting'], tier: 2, position: survivalPositions['looters-luck'] },
  { id: 'one-raiders-scraps', name: "One Raider's Scraps", description: 'You can salvage more resources from items.', category: 'survival', maxLevel: 5, prerequisites: ['in-round-crafting', 'stubborn-mule'], tier: 2, position: survivalPositions['one-raiders-scraps'] },
  { id: 'three-deep-breaths', name: 'Three Deep Breaths', description: 'Holding your breath while aiming lasts longer.', category: 'survival', maxLevel: 5, prerequisites: ['looters-luck'], tier: 2, position: survivalPositions['three-deep-breaths'] },
  { id: 'traveling-tinkerer', name: 'Traveling Tinkerer', description: 'You can craft while moving.', category: 'survival', maxLevel: 5, prerequisites: ['one-raiders-scraps'], tier: 2, position: survivalPositions['traveling-tinkerer'] },
  
  { id: 'security-breach', name: 'Security Breach', description: 'Unlock high-tier loot containers.', category: 'survival', maxLevel: 1, prerequisites: ['suffer-in-silence'], tier: 3, position: survivalPositions['security-breach'] },
  { id: 'minesweeper', name: 'Minesweeper', description: 'Defuse enemy deployables without triggering them.', category: 'survival', maxLevel: 1, prerequisites: ['security-breach'], tier: 3, position: survivalPositions['minesweeper'] },
];

export const KEY_SKILLS = [
  { name: "Survivor's Stamina", description: 'Faster stamina regen when hurt' },
  { name: 'Carry the Momentum', description: 'Free sprinting after dodge rolls' },
  { name: 'Security Breach', description: 'Unlock high-tier loot' },
  { name: 'Minesweeper', description: 'Defuse deployables' },
  { name: 'In-Round Crafting', description: 'Craft during raids' },
];

export function getRootSkills() {
  return {
    conditioning: MOCK_SKILLS.find(s => s.id === 'used-to-the-weight'),
    mobility: MOCK_SKILLS.find(s => s.id === 'nimble-climber'),
    survival: MOCK_SKILLS.find(s => s.id === 'agile-croucher'),
  };
}