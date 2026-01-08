import { memo } from 'react';
import { Skill, CATEGORY_COLORS, TIER_REQUIREMENTS } from '@/data/skillTreeData';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface SkillNodeProps {
  skill: Skill;
  currentLevel: number;
  canLearn: boolean;
  onAddPoint: () => void;
  onRemovePoint: () => void;
  categoryPoints: number;
}

const SKILL_ICON_BASE = '/skilltree%20ICONS';

const getSkillIconSrc = (skillName: string) =>
  `${SKILL_ICON_BASE}/${encodeURIComponent(skillName)}.png`;

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
  const isDimmed = isLocked && !isLearned;

  const iconSrc = getSkillIconSrc(skill.name);
  const iconColor = isLearned ? colors.primary : canLearn ? '#ffffff' : '#b4b4b4';

  // Big skills are 2x size, small skills are 0.5x (relative to big)
  // Big = 56px, Small = 28px
  const isBigSkill = skill.size === 'big';
  const bigScale = 1.5;
  const smallScale = 1.7;
  const nodeSize = (isBigSkill ? 56 : 28) * (isBigSkill ? bigScale : smallScale);
  const iconSize = (isBigSkill ? 24 : 12) * (isBigSkill ? bigScale : smallScale);
  const iconRenderSize = iconSize * 1.2;

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
            'relative flex flex-col items-center gap-1 cursor-pointer select-none transition-all duration-200',
            isDimmed && 'cursor-not-allowed'
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
          {/* Opaque background masks to hide connection lines under dimmed nodes */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: nodeSize,
              height: nodeSize,
              borderRadius: '9999px',
              backgroundColor: 'var(--background)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            className="font-bold tabular-nums"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '-6px',
              transform: 'translateX(-50%)',
              fontSize: isBigSkill ? '13px' : '10.4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: isBigSkill ? '18px' : '16px',
              color: 'transparent',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--background)',
              borderRadius: '999px',
              padding: '0 6px',
              lineHeight: 1,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            <span style={{ position: 'relative', top: isBigSkill ? (skill.tier === 2 ? '0px' : '-1px') : '1px' }}>
              {currentLevel}/{skill.maxLevel}
            </span>
          </div>
          {/* Skill Node Circle */}
          <div
            className={cn(
              'relative rounded-full flex items-center justify-center transition-all duration-300',
              isDimmed && 'opacity-40'
            )}
            style={{
              width: nodeSize,
              height: nodeSize,
              borderWidth: isBigSkill ? 3 : 2,
              borderStyle: 'solid',
              borderColor: isLearned ? colors.primary : '#666666',
              backgroundColor: isLearned ? '#0c0e11' : 'var(--background)',
              backgroundImage: 'none',
              boxShadow: 'none',
            }}
          >
            <span
              role="img"
              aria-label={`${skill.name} icon`}
              style={{
                width: iconRenderSize,
                height: iconRenderSize,
                backgroundColor: iconColor,
                WebkitMaskImage: `url("${iconSrc}")`,
                maskImage: `url("${iconSrc}")`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                opacity: isDimmed ? 0.45 : 1,
                transition: 'background-color 0.3s ease, opacity 0.3s ease',
              }}
            />

            {/* Level Counter badge */}
            <div
              className="font-bold tabular-nums"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '-6px',
                transform: 'translateX(-50%)',
                fontSize: isBigSkill ? '13px' : '10.4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: isBigSkill ? '18px' : '16px',
                color: isLearned ? colors.primary : '#b4b4b4',
                backgroundColor: 'var(--background)',
                border: `1px solid ${isLearned ? colors.primary : '#666666'}`,
                borderRadius: '999px',
                padding: '0 6px',
                lineHeight: 1,
              }}
            >
              <span style={{ position: 'relative', top: isBigSkill ? (skill.tier === 2 ? '0px' : '-1px') : '1px' }}>
                {currentLevel}/{skill.maxLevel}
              </span>
            </div>
          </div>
        </div>
      </HoverCardTrigger>

      {/* Always show hover card with info regardless of learned state */}
      <HoverCardContent 
        side="right" 
        className="w-[346px] border-white/10 shadow-2xl"
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
              className="font-bold uppercase tracking-wide"
              style={{ color: colors.primary, fontSize: '21px' }}
            >
              {skill.name}
            </h4>
            <span
              className="font-semibold px-1.5 py-0.5 rounded"
              style={{ 
                backgroundColor: `${colors.primary}20`,
                color: colors.primary,
                fontSize: '15px',
              }}
            >
              T{skill.tier}
            </span>
          </div>
          
          <p className="text-white/60 leading-relaxed" style={{ fontSize: '18px' }}>
            {skill.description}
          </p>
          
          <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
            <span className="text-white/40" style={{ fontSize: '15px' }}>
              Level: {currentLevel}/{skill.maxLevel}
            </span>
            {isTierLocked && skill.requiredPoints && (
              <span className="text-red-400" style={{ fontSize: '15px' }}>
                Requires {skill.requiredPoints} pts
              </span>
            )}
            {isMaxed && (
              <span className="font-semibold" style={{ color: colors.primary, fontSize: '15px' }}>
                MAXED
              </span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});







