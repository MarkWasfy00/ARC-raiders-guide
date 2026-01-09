export type SkillCategory = 'conditioning' | 'mobility' | 'survival';
export type SkillSize = 'big' | 'small';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  prerequisites: string[];
  tier: 1 | 2 | 3;
  position: { x: number; y: number };
  size: SkillSize;
  requiredPoints?: number; // Points required to unlock (15 or 36)
  lineRadiusFudge?: number;
}

// Colors match MetaForge: Conditioning=Green, Mobility=Yellow, Survival=Red
export const CATEGORY_COLORS: Record<SkillCategory, { primary: string; muted: string; bg: string; glow: string }> = {
  conditioning: {
    primary: '#1BFF7B',
    muted: '#12cc62',
    bg: 'rgba(27, 255, 123, 0.12)',
    glow: 'rgba(27, 255, 123, 0.45)',
  },
  mobility: {
    primary: '#FFD008',
    muted: '#cfa906',
    bg: 'rgba(255, 208, 8, 0.12)',
    glow: 'rgba(255, 208, 8, 0.45)',
  },
  survival: {
    primary: '#F60110',
    muted: '#c4000d',
    bg: 'rgba(246, 1, 16, 0.12)',
    glow: 'rgba(246, 1, 16, 0.45)',
  },
};

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  conditioning: 'اللياقة',
  mobility: 'الحركة',
  survival: 'البقاء',
};

export const TIER_REQUIREMENTS = {
  tier2: 15,
  tier3: 36,
};

export const MAX_TOTAL_POINTS = 76; // Levels 0-75
export const MAX_EXPEDITION_POINTS = 5; // Bonus points from Expedition Projects
export const MAX_LEVEL = 75;

// Big skills (2 inputs or 2 outputs branching points)
export const BIG_SKILLS = [
  // Root skills with 2 outputs
  'used-to-the-weight',
  'nimble-climber', 
  'agile-croucher',
  // Tier 2 milestone skills with 2 outputs (require 15 points)
  'survivors-stamina',
  'unburdened-roll',
  'carry-the-momentum',
  'calming-stroll',
  'suffer-in-silence',
  'good-as-new',
  // Tier 3 capstones with 2 inputs (require 36 points)
  'back-on-your-feet',
  'flyswatter',
  'vaults-on-vaults',
  'vault-spring',
  'security-breach',
  'minesweeper',
];

// Small skills with special connections
export const SMALL_SKILLS_2_INPUTS_1_OUTPUT = ['a-little-extra', 'crawl-before-you-walk', 'traveling-tinkerer'];
export const SMALL_SKILLS_1_INPUT_2_OUTPUTS = ['one-raiders-scraps', 'vigorous-vaulter', 'loaded-arms'];

// Canvas layout - widened mobility branch for label space
const CANVAS_CENTER_X = 700;
const ROOT_Y = 620; // Moved up to create space
const V_STEP = 99; // Vertical spacing between skill rows
const H_STEP = 60; // Horizontal spacing
const H_SCALE = 1.5;
const scaleX = (x: number) => CANVAS_CENTER_X + (x - CANVAS_CENTER_X) * H_SCALE;

// CONDITIONING (LEFT / GREEN) - fans out to the upper-left
const CONDITIONING_X_OFFSET = 100;
const conditioningPositions: Record<string, { x: number; y: number }> = {
  // Root - big skill
  'used-to-the-weight': { x: scaleX(420 + CONDITIONING_X_OFFSET), y: ROOT_Y },
  
  // Tier 1 path - left branch
  'blast-born': { x: scaleX(350 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 1.2 },
  'fight-or-flight': { x: scaleX(280 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 2.4 },
  
  // Tier 1 path - right branch  
  'gentle-pressure': { x: scaleX(420 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 1.2 },
  'proficient-pryer': { x: scaleX(420 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 2.4 },
  
  // Tier 2 - milestone skills (big, require 15 pts)
  'survivors-stamina': { x: scaleX(220 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 3.6 },
  'unburdened-roll': { x: scaleX(350 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 3.6 },
  
  // Tier 2 - branches from survivors-stamina
  'downed-but-determined': { x: scaleX(150 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 4.8 },
  'a-little-extra': { x: scaleX(260 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 4.8 }, // 2 inputs 1 output
  
  // Tier 2 - branches from unburdened-roll
  'effortless-swing': { x: scaleX(350 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 4.8 },
  
  // Tier 2 - next level
  'turtle-crawl': { x: scaleX(150 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 6 },
  'loaded-arms': { x: scaleX(260 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 6 }, // 1 input 2 outputs
  'sky-clearing-swing': { x: scaleX(350 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 6 },
  
  // Tier 3 - capstones (big, require 36 pts)
  'back-on-your-feet': { x: scaleX(200 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 7.2 },
  'flyswatter': { x: scaleX(320 + CONDITIONING_X_OFFSET), y: ROOT_Y - V_STEP * 7.2 },
};

// MOBILITY (CENTER / YELLOW) - widened for label space
const mobilityPositions: Record<string, { x: number; y: number }> = {
  // Root - big skill
  'nimble-climber': { x: scaleX(CANVAS_CENTER_X), y: ROOT_Y },
  
  // Tier 1 - left branch
  'marathon-runner': { x: scaleX(CANVAS_CENTER_X - 80), y: ROOT_Y - V_STEP * 1.2 },
  'youthful-lungs': { x: scaleX(CANVAS_CENTER_X - 80), y: ROOT_Y - V_STEP * 2.4 },
  
  // Tier 1 - right branch
  'slip-and-slide': { x: scaleX(CANVAS_CENTER_X + 80), y: ROOT_Y - V_STEP * 1.2 },
  'sturdy-ankles': { x: scaleX(CANVAS_CENTER_X + 80), y: ROOT_Y - V_STEP * 2.4 },
  
  // Tier 2 - milestone skills (big, require 15 pts)
  'carry-the-momentum': { x: scaleX(CANVAS_CENTER_X - 80), y: ROOT_Y - V_STEP * 3.6 },
  'calming-stroll': { x: scaleX(CANVAS_CENTER_X + 80), y: ROOT_Y - V_STEP * 3.6 },
  
  // Tier 2 - branches
  'effortless-roll': { x: scaleX(CANVAS_CENTER_X - 140), y: ROOT_Y - V_STEP * 4.8 },
  'crawl-before-you-walk': { x: scaleX(CANVAS_CENTER_X), y: ROOT_Y - V_STEP * 4.8 }, // 2 inputs 1 output
  'off-the-wall': { x: scaleX(CANVAS_CENTER_X + 140), y: ROOT_Y - V_STEP * 4.8 },
  
  // Tier 2 - next level
  'heroic-leap': { x: scaleX(CANVAS_CENTER_X - 140), y: ROOT_Y - V_STEP * 6 },
  'vigorous-vaulter': { x: scaleX(CANVAS_CENTER_X), y: ROOT_Y - V_STEP * 6 }, // 1 input 2 outputs
  'ready-to-roll': { x: scaleX(CANVAS_CENTER_X + 140), y: ROOT_Y - V_STEP * 6 },
  
  // Tier 3 - capstones (big, require 36 pts)
  'vaults-on-vaults': { x: scaleX(CANVAS_CENTER_X - 70), y: ROOT_Y - V_STEP * 7.2 },
  'vault-spring': { x: scaleX(CANVAS_CENTER_X + 70), y: ROOT_Y - V_STEP * 7.2 },
};

// SURVIVAL (RIGHT / RED) - mirrored from conditioning around mobility center
const mirrorX = (x: number) => CANVAS_CENTER_X * 2 - x;
const mirrorPosition = (key: keyof typeof conditioningPositions) => {
  const source = conditioningPositions[key];
  return { x: mirrorX(source.x), y: source.y };
};

const survivalPositions: Record<string, { x: number; y: number }> = {
  // Root - big skill
  'agile-croucher': mirrorPosition('used-to-the-weight'),
  
  // Tier 1 - left branch (mirrors conditioning right branch)
  'looters-instincts': mirrorPosition('gentle-pressure'),
  'silent-scavenger': mirrorPosition('proficient-pryer'),
  
  // Tier 1 - right branch (mirrors conditioning left branch)
  'revitalizing-squat': mirrorPosition('blast-born'),
  'in-round-crafting': mirrorPosition('fight-or-flight'),
  
  // Tier 2 - milestone skills (big, require 15 pts)
  'suffer-in-silence': mirrorPosition('unburdened-roll'),
  'good-as-new': mirrorPosition('survivors-stamina'),
  
  // Tier 2 - branches
  'broad-shoulders': mirrorPosition('effortless-swing'),
  'traveling-tinkerer': mirrorPosition('a-little-extra'), // 2 inputs 1 output
  'stubborn-mule': mirrorPosition('downed-but-determined'),
  
  // Tier 2 - next level
  'looters-luck': mirrorPosition('sky-clearing-swing'),
  'one-raiders-scraps': mirrorPosition('loaded-arms'), // 1 input 2 outputs
  'three-deep-breaths': mirrorPosition('turtle-crawl'),
  
  // Tier 3 - capstones (big, require 36 pts)
  'security-breach': mirrorPosition('flyswatter'),
  'minesweeper': mirrorPosition('back-on-your-feet'),
};

export const MOCK_SKILLS: Skill[] = [
  // CONDITIONING (GREEN/LEFT)
  // Root skill (big)
  { id: 'used-to-the-weight', name: 'Used to the Weight', description: 'ارتداء الدرع لا يبطئك بقدر كبير.', category: 'conditioning', maxLevel: 5, prerequisites: [], tier: 1, position: conditioningPositions['used-to-the-weight'], size: 'big', lineRadiusFudge: 7 },

  // Path C1-C6: Used To The Weight → Blast-Born / Gentle Pressure
  { id: 'blast-born', name: 'Blast-Born', description: 'سمعك يتأثر بشكل أقل بالانفجارات القريبة.', category: 'conditioning', maxLevel: 5, prerequisites: ['used-to-the-weight'], tier: 1, position: conditioningPositions['blast-born'], size: 'small' },
  { id: 'gentle-pressure', name: 'Gentle Pressure', description: 'تصدر ضوضاء أقل عند الاقتحام.', category: 'conditioning', maxLevel: 5, prerequisites: ['used-to-the-weight'], tier: 1, position: conditioningPositions['gentle-pressure'], size: 'small' },

  // Next tier
  { id: 'fight-or-flight', name: 'Fight or Flight', description: 'عندما تصاب في القتال، تستعيد كمية ثابتة من القدرة على التحمل.', category: 'conditioning', maxLevel: 5, prerequisites: ['blast-born'], tier: 1, position: conditioningPositions['fight-or-flight'], size: 'small' },
  { id: 'proficient-pryer', name: 'Proficient Pryer', description: 'اقتحام الأبواب والحاويات يستغرق وقتاً أقل.', category: 'conditioning', maxLevel: 5, prerequisites: ['gentle-pressure'], tier: 1, position: conditioningPositions['proficient-pryer'], size: 'small' },

  // Tier 2 milestone skills (big, require 15 pts)
  { id: 'survivors-stamina', name: "Survivor's Stamina", description: 'عندما تصاب بجروح خطيرة، تتجدد قدرتك على التحمل بشكل أسرع.', category: 'conditioning', maxLevel: 5, prerequisites: ['fight-or-flight'], tier: 2, position: conditioningPositions['survivors-stamina'], size: 'big', requiredPoints: 15 },
  { id: 'unburdened-roll', name: 'Unburdened Roll', description: 'إذا انكسر درعك، أول تدحرج للمراوغة لن يستهلك قدرة على التحمل.', category: 'conditioning', maxLevel: 5, prerequisites: ['proficient-pryer'], tier: 2, position: conditioningPositions['unburdened-roll'], size: 'big', requiredPoints: 15 },

  // Branches from survivors-stamina and unburdened-roll
  { id: 'downed-but-determined', name: 'Downed But Determined', description: 'عندما تسقط، يستغرق الأمر وقتاً أطول قبل أن تنهار.', category: 'conditioning', maxLevel: 5, prerequisites: ['survivors-stamina'], tier: 2, position: conditioningPositions['downed-but-determined'], size: 'small' },
  { id: 'a-little-extra', name: 'A Little Extra', description: 'اقتحام جسم ما يولد موارد.', category: 'conditioning', maxLevel: 5, prerequisites: ['survivors-stamina', 'unburdened-roll'], tier: 2, position: conditioningPositions['a-little-extra'], size: 'small' },
  { id: 'effortless-swing', name: 'Effortless Swing', description: 'قدرات القتال القريب تستهلك قدرة أقل على التحمل.', category: 'conditioning', maxLevel: 5, prerequisites: ['unburdened-roll'], tier: 2, position: conditioningPositions['effortless-swing'], size: 'small' },

  // Next level
  { id: 'turtle-crawl', name: 'Turtle Crawl', description: 'أثناء السقوط، تتلقى ضرراً أقل.', category: 'conditioning', maxLevel: 5, prerequisites: ['downed-but-determined'], tier: 2, position: conditioningPositions['turtle-crawl'], size: 'small' },
  { id: 'loaded-arms', name: 'Loaded Arms', description: 'سلاحك المجهز له تأثير أقل على وزنك.', category: 'conditioning', maxLevel: 5, prerequisites: ['a-little-extra'], tier: 2, position: conditioningPositions['loaded-arms'], size: 'small' },
  { id: 'sky-clearing-swing', name: 'Sky-Clearing Swing', description: 'تلحق المزيد من الضرر القريب بالطائرات المسيرة.', category: 'conditioning', maxLevel: 5, prerequisites: ['effortless-swing'], tier: 2, position: conditioningPositions['sky-clearing-swing'], size: 'small' },

  // Tier 3 capstones (big, require 36 pts)
  { id: 'back-on-your-feet', name: 'Back On Your Feet', description: 'عندما تصاب بجروح خطيرة، تتجدد صحتك حتى حد معين.', category: 'conditioning', maxLevel: 1, prerequisites: ['turtle-crawl', 'loaded-arms'], tier: 3, position: conditioningPositions['back-on-your-feet'], size: 'big', requiredPoints: 36 },
  { id: 'flyswatter', name: 'Flyswatter', description: 'يمكن تدمير الدبابير والأبراج بهجوم قريب واحد.', category: 'conditioning', maxLevel: 1, prerequisites: ['loaded-arms', 'sky-clearing-swing'], tier: 3, position: conditioningPositions['flyswatter'], size: 'big', requiredPoints: 36 },

  // MOBILITY (YELLOW/CENTER)
  // Root skill (big)
  { id: 'nimble-climber', name: 'Nimble Climber', description: 'يمكنك التسلق والقفز بسرعة أكبر.', category: 'mobility', maxLevel: 5, prerequisites: [], tier: 1, position: mobilityPositions['nimble-climber'], size: 'big' },

  // Branches from nimble-climber
  { id: 'marathon-runner', name: 'Marathon Runner', description: 'التحرك يستهلك قدرة أقل على التحمل.', category: 'mobility', maxLevel: 5, prerequisites: ['nimble-climber'], tier: 1, position: mobilityPositions['marathon-runner'], size: 'small' },
  { id: 'slip-and-slide', name: 'Slip and Slide', description: 'يمكنك الانزلاق لمسافة أبعد وبسرعة أكبر.', category: 'mobility', maxLevel: 5, prerequisites: ['nimble-climber'], tier: 1, position: mobilityPositions['slip-and-slide'], size: 'small' },

  // Next tier
  { id: 'youthful-lungs', name: 'Youthful Lungs', description: 'يزيد من قدرتك القصوى على التحمل.', category: 'mobility', maxLevel: 5, prerequisites: ['marathon-runner'], tier: 1, position: mobilityPositions['youthful-lungs'], size: 'small' },
  { id: 'sturdy-ankles', name: 'Sturdy Ankles', description: 'تتلقى ضرر سقوط أقل عند السقوط من ارتفاع غير مميت.', category: 'mobility', maxLevel: 5, prerequisites: ['slip-and-slide'], tier: 1, position: mobilityPositions['sturdy-ankles'], size: 'small' },

  // Tier 2 milestone skills (big, require 15 pts)
  { id: 'carry-the-momentum', name: 'Carry the Momentum', description: 'بعد تدحرج المراوغة أثناء الركض، الركض لا يستهلك قدرة على التحمل لفترة قصيرة.', category: 'mobility', maxLevel: 5, prerequisites: ['youthful-lungs'], tier: 2, position: mobilityPositions['carry-the-momentum'], size: 'big', requiredPoints: 15 },
  { id: 'calming-stroll', name: 'Calming Stroll', description: 'أثناء المشي، تتجدد قدرتك على التحمل كما لو كنت واقفاً.', category: 'mobility', maxLevel: 5, prerequisites: ['sturdy-ankles'], tier: 2, position: mobilityPositions['calming-stroll'], size: 'big', requiredPoints: 15 },

  // Branches from milestone skills
  { id: 'effortless-roll', name: 'Effortless Roll', description: 'التدحرج للمراوغة يستهلك قدرة أقل على التحمل.', category: 'mobility', maxLevel: 5, prerequisites: ['carry-the-momentum'], tier: 2, position: mobilityPositions['effortless-roll'], size: 'small' },
  { id: 'crawl-before-you-walk', name: 'Crawl Before You Walk', description: 'عندما تسقط، تزحف بسرعة أكبر.', category: 'mobility', maxLevel: 5, prerequisites: ['carry-the-momentum', 'calming-stroll'], tier: 2, position: mobilityPositions['crawl-before-you-walk'], size: 'small' },
  { id: 'off-the-wall', name: 'Off the Wall', description: 'يمكنك القفز من الحائط لمسافة أبعد.', category: 'mobility', maxLevel: 5, prerequisites: ['calming-stroll'], tier: 2, position: mobilityPositions['off-the-wall'], size: 'small' },

  // Next level
  { id: 'heroic-leap', name: 'Heroic Leap', description: 'يمكنك التدحرج للمراوغة أثناء الركض لمسافة أبعد.', category: 'mobility', maxLevel: 5, prerequisites: ['effortless-roll'], tier: 2, position: mobilityPositions['heroic-leap'], size: 'small' },
  { id: 'vigorous-vaulter', name: 'Vigorous Vaulter', description: 'القفز لم يعد يتباطأ عندما تكون منهكاً.', category: 'mobility', maxLevel: 5, prerequisites: ['crawl-before-you-walk'], tier: 2, position: mobilityPositions['vigorous-vaulter'], size: 'small' },
  { id: 'ready-to-roll', name: 'Ready to Roll', description: 'عند السقوط، تزداد نافذة التوقيت لتدحرج الاستعادة.', category: 'mobility', maxLevel: 5, prerequisites: ['off-the-wall'], tier: 2, position: mobilityPositions['ready-to-roll'], size: 'small' },

  // Tier 3 capstones (big, require 36 pts)
  { id: 'vaults-on-vaults', name: 'Vaults on Vaults on Vaults', description: 'القفز لم يعد يستهلك قدرة على التحمل.', category: 'mobility', maxLevel: 1, prerequisites: ['heroic-leap', 'vigorous-vaulter'], tier: 3, position: mobilityPositions['vaults-on-vaults'], size: 'big', requiredPoints: 36 },
  { id: 'vault-spring', name: 'Vault Spring', description: 'يتيح لك القفز في نهاية القفزة.', category: 'mobility', maxLevel: 1, prerequisites: ['vigorous-vaulter', 'ready-to-roll'], tier: 3, position: mobilityPositions['vault-spring'], size: 'big', requiredPoints: 36 },

  // SURVIVAL (RED/RIGHT)
  // Root skill (big)
  { id: 'agile-croucher', name: 'Agile Croucher', description: 'سرعة حركتك أثناء الانحناء تزداد.', category: 'survival', maxLevel: 5, prerequisites: [], tier: 1, position: survivalPositions['agile-croucher'], size: 'big' },

  // Branches from agile-croucher
  { id: 'looters-instincts', name: "Looter's Instincts", description: 'عند تفتيش حاوية، يتم الكشف عن الغنائم بشكل أسرع.', category: 'survival', maxLevel: 5, prerequisites: ['agile-croucher'], tier: 1, position: survivalPositions['looters-instincts'], size: 'small' },
  { id: 'revitalizing-squat', name: 'Revitalizing Squat', description: 'تجدد القدرة على التحمل أثناء الانحناء يزداد.', category: 'survival', maxLevel: 5, prerequisites: ['agile-croucher'], tier: 1, position: survivalPositions['revitalizing-squat'], size: 'small' },

  // Next tier
  { id: 'silent-scavenger', name: 'Silent Scavenger', description: 'تصدر ضوضاء أقل عند النهب.', category: 'survival', maxLevel: 5, prerequisites: ['looters-instincts'], tier: 1, position: survivalPositions['silent-scavenger'], size: 'small' },
  { id: 'in-round-crafting', name: 'In-Round Crafting', description: 'يمكنك صنع عناصر معينة أثناء الغارات.', category: 'survival', maxLevel: 3, prerequisites: ['revitalizing-squat'], tier: 1, position: survivalPositions['in-round-crafting'], size: 'small' },

  // Tier 2 milestone skills (big, require 15 pts)
  { id: 'suffer-in-silence', name: 'Suffer in Silence', description: 'تصدر ضوضاء أقل عند الإصابة.', category: 'survival', maxLevel: 5, prerequisites: ['silent-scavenger'], tier: 2, position: survivalPositions['suffer-in-silence'], size: 'big', requiredPoints: 15 },
  { id: 'good-as-new', name: 'Good As New', description: 'عناصر العلاج أكثر فعالية.', category: 'survival', maxLevel: 5, prerequisites: ['in-round-crafting'], tier: 2, position: survivalPositions['good-as-new'], size: 'big', requiredPoints: 15 },

  // Branches from milestone skills
  { id: 'broad-shoulders', name: 'Broad Shoulders', description: 'تزداد قدرتك على الحمل.', category: 'survival', maxLevel: 5, prerequisites: ['suffer-in-silence'], tier: 2, position: survivalPositions['broad-shoulders'], size: 'small' },
  { id: 'traveling-tinkerer', name: 'Traveling Tinkerer', description: 'يمكنك الصنع أثناء الحركة.', category: 'survival', maxLevel: 5, prerequisites: ['suffer-in-silence', 'good-as-new'], tier: 2, position: survivalPositions['traveling-tinkerer'], size: 'small' },
  { id: 'stubborn-mule', name: 'Stubborn Mule', description: 'يتم تقليل عقوبة سرعة الحركة من حمل أحمال ثقيلة.', category: 'survival', maxLevel: 5, prerequisites: ['good-as-new'], tier: 2, position: survivalPositions['stubborn-mule'], size: 'small' },

  // Next level
  { id: 'looters-luck', name: "Looter's Luck", description: 'فرصة للعثور على غنائم إضافية في الحاويات.', category: 'survival', maxLevel: 5, prerequisites: ['broad-shoulders'], tier: 2, position: survivalPositions['looters-luck'], size: 'small' },
  { id: 'one-raiders-scraps', name: "One Raider's Scraps", description: 'يمكنك استعادة المزيد من الموارد من العناصر.', category: 'survival', maxLevel: 5, prerequisites: ['traveling-tinkerer'], tier: 2, position: survivalPositions['one-raiders-scraps'], size: 'small' },
  { id: 'three-deep-breaths', name: 'Three Deep Breaths', description: 'حبس أنفاسك أثناء التصويب يستمر لفترة أطول.', category: 'survival', maxLevel: 5, prerequisites: ['stubborn-mule'], tier: 2, position: survivalPositions['three-deep-breaths'], size: 'small' },

  // Tier 3 capstones (big, require 36 pts)
  { id: 'security-breach', name: 'Security Breach', description: 'فتح حاويات الغنائم ذات المستوى العالي.', category: 'survival', maxLevel: 1, prerequisites: ['looters-luck', 'one-raiders-scraps'], tier: 3, position: survivalPositions['security-breach'], size: 'big', requiredPoints: 36 },
  { id: 'minesweeper', name: 'Minesweeper', description: 'تفكيك الأدوات القابلة للنشر للعدو دون تفعيلها.', category: 'survival', maxLevel: 1, prerequisites: ['one-raiders-scraps', 'three-deep-breaths'], tier: 3, position: survivalPositions['minesweeper'], size: 'big', requiredPoints: 36 },
];

export const KEY_SKILLS = [
  { name: "Survivor's Stamina", description: 'تجدد أسرع للقدرة على التحمل عند الإصابة' },
  { name: 'Carry the Momentum', description: 'ركض مجاني بعد التدحرج للمراوغة' },
  { name: 'Security Breach', description: 'فتح الغنائم ذات المستوى العالي' },
  { name: 'Minesweeper', description: 'تفكيك الأدوات القابلة للنشر' },
  { name: 'In-Round Crafting', description: 'الصنع أثناء الغارات' },
];

export function getRootSkills() {
  return {
    conditioning: MOCK_SKILLS.find(s => s.id === 'used-to-the-weight'),
    mobility: MOCK_SKILLS.find(s => s.id === 'nimble-climber'),
    survival: MOCK_SKILLS.find(s => s.id === 'agile-croucher'),
  };
}

