import { memo } from 'react';
import { Skill, CATEGORY_COLORS, TIER_REQUIREMENTS } from '@/data/skillTreeData';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  Shield, Zap, Footprints, Heart, Lock, Weight, Bomb, Volume2, Timer, Sword,
  Mountain, Wind, Gauge, Move, Dumbbell, Eye, Package, Wrench, Search, Crosshair,
  ArrowRight, Leaf, Waves, AlertTriangle, Target, Backpack, Compass, UserCheck,
  Anchor, RefreshCw
} from 'lucide-react';

interface SkillNodeProps {
  skill: Skill;
  currentLevel: number;
  canLearn: boolean;
  onAddPoint: () => void;
  onRemovePoint: () => void;
  categoryPoints: number;
}

const getSkillIcon = (skillId: string) => {
  const iconMap: Record<string, React.ElementType> = {
    // Conditioning
    'used-to-the-weight': Weight,
    'blast-born': Bomb,
    'gentle-pressure': Volume2,
    'proficient-pryer': Timer,
    'fight-or-flight': Zap,
    'survivors-stamina': Heart,
    'unburdened-roll': Move,
    'a-little-extra': Package,
    'effortless-swing': Sword,
    'downed-but-determined': Shield,
    'turtle-crawl': Shield,
    'loaded-arms': Dumbbell,
    'sky-clearing-swing': Sword,
    'back-on-your-feet': RefreshCw,
    'flyswatter': Crosshair,
    // Mobility
    'nimble-climber': Mountain,
    'marathon-runner': Footprints,
    'slip-and-slide': Waves,
    'youthful-lungs': Gauge,
    'sturdy-ankles': Anchor,
    'carry-the-momentum': ArrowRight,
    'calming-stroll': Leaf,
    'effortless-roll': Move,
    'heroic-leap': Move,
    'crawl-before-you-walk': Footprints,
    'vigorous-vaulter': Mountain,
    'off-the-wall': Mountain,
    'ready-to-roll': Move,
    'vaults-on-vaults': Mountain,
    'vault-spring': Move,
    // Survival
    'agile-croucher': UserCheck,
    'looters-instincts': Eye,
    'revitalizing-squat': Heart,
    'silent-scavenger': Volume2,
    'broad-shoulders': Backpack,
    'suffer-in-silence': Volume2,
    'good-as-new': Heart,
    'in-round-crafting': Wrench,
    'stubborn-mule': Dumbbell,
    'looters-luck': Search,
    'one-raiders-scraps': Package,
    'three-deep-breaths': Target,
    'traveling-tinkerer': Compass,
    'security-breach': Lock,
    'minesweeper': AlertTriangle,
  };
  return iconMap[skillId] || Shield;
};

export const SkillNode = memo(function SkillNode({
  skill,
  currentLevel,
  canLearn,
  onAddPoint,
  onRemovePoint,
  categoryPoints,
}: SkillNodeProps) {
  const isLearned = currentLevel > 0;
  const isMaxed = currentLevel >= skill.maxLevel;
  const colors = CATEGORY_COLORS[skill.category];
  
  const tierRequirement = skill.requiredPoints || 
                          (skill.tier === 2 ? TIER_REQUIREMENTS.tier2 : 
                          skill.tier === 3 ? TIER_REQUIREMENTS.tier3 : 0);
  const meetsPointRequirement = categoryPoints >= tierRequirement;
  const isTierLocked = !meetsPointRequirement && skill.tier > 1 && skill.requiredPoints;
  const isLocked = (!canLearn && !isLearned) || isTierLocked;

  const IconComponent = getSkillIcon(skill.id);

  // Big skills are 2x size, small skills are 0.5x (relative to big)
  // Big = 56px, Small = 28px
  const isBigSkill = skill.size === 'big';
  const nodeSize = isBigSkill ? 56 : 28;
  const iconSize = isBigSkill ? 24 : 12;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canLearn && !isMaxed && !isTierLocked) {
      onAddPoint();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentLevel > 0) {
      onRemovePoint();
    }
  };

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'flex flex-col items-center gap-1 cursor-pointer select-none transition-all duration-200',
            isLocked && !isLearned && 'opacity-40 cursor-not-allowed'
          )}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            position: 'absolute',
            left: skill.position.x,
            top: skill.position.y,
            transform: 'translate(-50%, -50%)',
            zIndex: 10, // Ensure nodes are above connection lines
          }}
        >
          {/* Skill Node Circle */}
          <div
            className="relative rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              width: nodeSize,
              height: nodeSize,
              borderWidth: isBigSkill ? 3 : 2,
              borderStyle: 'solid',
              borderColor: isLearned ? colors.primary : '#3a3f4a',
              backgroundColor: isLearned 
                ? colors.bg 
                : '#13161b',
              boxShadow: isLearned 
                ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}` 
                : 'none',
            }}
          >
            <IconComponent 
              style={{
                width: iconSize,
                height: iconSize,
                color: isLearned ? colors.primary : '#6b7280',
                transition: 'color 0.3s ease',
              }}
            />
            
            {/* Lock overlay removed */}
          </div>

          {/* Level Counter below node */}
          <div
            className="font-bold tabular-nums"
            style={{
              fontSize: isBigSkill ? '10px' : '8px',
              color: isLearned ? colors.primary : '#6b7280',
              transform:
                skill.id === 'survivors-stamina' ||
                skill.id === 'unburdened-roll' ||
                skill.id === 'downed-but-determined' ||
                skill.id === 'a-little-extra' ||
                skill.id === 'back-on-your-feet' ||
                skill.id === 'flyswatter'
                  ? 'translateX(0px)'
                  : skill.category === 'conditioning'
                    ? 'translateX(-10px)'
                    : undefined,
            }}
          >
            {currentLevel}/{skill.maxLevel}
          </div>
        </div>
      </HoverCardTrigger>

      {/* Always show hover card with info regardless of learned state */}
      <HoverCardContent 
        side="right" 
        className="w-72 border-white/10 shadow-2xl"
        style={{ 
          backgroundColor: 'rgba(13, 15, 18, 0.95)', 
          backdropFilter: 'blur(12px)',
          zIndex: 50,
        }}
        sideOffset={15}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 
              className="font-bold uppercase tracking-wide text-sm"
              style={{ color: colors.primary }}
            >
              {skill.name}
            </h4>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: `${colors.primary}20`,
                color: colors.primary 
              }}
            >
              T{skill.tier}
            </span>
          </div>
          
          <p className="text-xs text-white/60 leading-relaxed">
            {skill.description}
          </p>
          
          <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
            <span className="text-[10px] text-white/40">
              Level: {currentLevel}/{skill.maxLevel}
            </span>
            {isTierLocked && skill.requiredPoints && (
              <span className="text-[10px] text-red-400">
                Requires {skill.requiredPoints} pts
              </span>
            )}
            {isMaxed && (
              <span className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                MAXED
              </span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});
