import { memo } from 'react';
import { MOCK_SKILLS, CATEGORY_COLORS } from '@/data/skillTreeData';

interface SkillConnectionsProps {
  skillLevels: Record<string, number>;
}

export const SkillConnections = memo(function SkillConnections({
  skillLevels,
}: SkillConnectionsProps) {
  const connections: JSX.Element[] = [];
  const rootNodeIds = new Set(['nimble-climber', 'agile-croucher']);
  const connectionFudge: Record<string, number> = {
    'used-to-the-weight->blast-born': -1.5,
    'used-to-the-weight->gentle-pressure': 2,
    'blast-born->fight-or-flight': 3,
    'gentle-pressure->proficient-pryer': 7,
    'fight-or-flight->survivors-stamina':4,
    'proficient-pryer->unburdened-roll': 3.5,
    'survivors-stamina->downed-but-determined': 4,
    'survivors-stamina->a-little-extra': 6,
    'unburdened-roll->a-little-extra': 4,
    'unburdened-roll->effortless-swing': 8,
    'downed-but-determined->turtle-crawl': 7.5,
    'a-little-extra->loaded-arms': 8,
    'effortless-swing->sky-clearing-swing': 8,
    'turtle-crawl->back-on-your-feet': 5,
    'loaded-arms->back-on-your-feet': 4,
    'loaded-arms->flyswatter': 4,
    'sky-clearing-swing->flyswatter': 6,
    'nimble-climber->marathon-runner': 32,
    'nimble-climber->slip-and-slide': 32,
    'marathon-runner->youthful-lungs': 4,
    'slip-and-slide->sturdy-ankles': 4,
    'youthful-lungs->carry-the-momentum': 4,
    'sturdy-ankles->calming-stroll': 4,
    'carry-the-momentum->effortless-roll': 1,
    'carry-the-momentum->crawl-before-you-walk': 1,
    'calming-stroll->crawl-before-you-walk': 1,
    'calming-stroll->off-the-wall': 1,
    'effortless-roll->heroic-leap': 4,
    'crawl-before-you-walk->vigorous-vaulter': 4,
    'off-the-wall->ready-to-roll': 4,
    'heroic-leap->vaults-on-vaults': 0,
    'vigorous-vaulter->vaults-on-vaults': 0,
    'vigorous-vaulter->vault-spring': 0,
    'ready-to-roll->vault-spring': 0,
    'agile-croucher->looters-instincts': 36,
    'agile-croucher->revitalizing-squat': 32,
    'looters-instincts->silent-scavenger': 3,
    'revitalizing-squat->in-round-crafting': 0,
    'silent-scavenger->suffer-in-silence': 0,
    'in-round-crafting->good-as-new': 0,
    'suffer-in-silence->broad-shoulders': 4,
    'suffer-in-silence->traveling-tinkerer': 0,
    'good-as-new->traveling-tinkerer': 3,
    'good-as-new->stubborn-mule': 0,
    'broad-shoulders->looters-luck': 3,
    'traveling-tinkerer->one-raiders-scraps': 3,
    'stubborn-mule->three-deep-breaths': 3,
    'looters-luck->security-breach': 3,
    'one-raiders-scraps->security-breach': 0,
    'one-raiders-scraps->minesweeper': 0,
    'three-deep-breaths->minesweeper': 1,
  };
  const connectionEndFudge: Record<string, number> = {
    'used-to-the-weight->blast-born': -7,
    'used-to-the-weight->gentle-pressure': -8,
    'blast-born->fight-or-flight': -7,
    'gentle-pressure->proficient-pryer': -8,
    'fight-or-flight->survivors-stamina': -8,
    'proficient-pryer->unburdened-roll': -8,
    'survivors-stamina->downed-but-determined': -7,
    'survivors-stamina->a-little-extra': -8,
    'unburdened-roll->a-little-extra': -7,
    'unburdened-roll->effortless-swing': -8,
    'downed-but-determined->turtle-crawl': -8,
    'a-little-extra->loaded-arms': -8,
    'effortless-swing->sky-clearing-swing': -8,
    'turtle-crawl->back-on-your-feet': -8,
    'loaded-arms->back-on-your-feet': -8,
    'loaded-arms->flyswatter': -8,
    'sky-clearing-swing->flyswatter': -9,
    'nimble-climber->marathon-runner': -11,
    'nimble-climber->slip-and-slide': -11,
    'marathon-runner->youthful-lungs': -13,
    'slip-and-slide->sturdy-ankles': -13,
    'youthful-lungs->carry-the-momentum': -14.5,
    'sturdy-ankles->calming-stroll': -14.5,
    'carry-the-momentum->effortless-roll': -12,
    'carry-the-momentum->crawl-before-you-walk': -11,
    'calming-stroll->crawl-before-you-walk': -11,
    'calming-stroll->off-the-wall': -12,
    'effortless-roll->heroic-leap': -13,
    'crawl-before-you-walk->vigorous-vaulter': -13,
    'off-the-wall->ready-to-roll': -13,
    'heroic-leap->vaults-on-vaults': -13,
    'vigorous-vaulter->vaults-on-vaults': -13,
    'vigorous-vaulter->vault-spring': -13,
    'ready-to-roll->vault-spring': -13,
    'agile-croucher->looters-instincts': -13,
    'agile-croucher->revitalizing-squat': -11.5,
    'looters-instincts->silent-scavenger': -13,
    'revitalizing-squat->in-round-crafting': -11.5,
    'silent-scavenger->suffer-in-silence': -13,
    'in-round-crafting->good-as-new': -13,
    'suffer-in-silence->broad-shoulders': -13,
    'suffer-in-silence->traveling-tinkerer': -11,
    'good-as-new->traveling-tinkerer': -11,
    'good-as-new->stubborn-mule': -11,
    'broad-shoulders->looters-luck': -12,
    'traveling-tinkerer->one-raiders-scraps': -12,
    'stubborn-mule->three-deep-breaths': -12,
    'looters-luck->security-breach': -14,
    'one-raiders-scraps->security-breach': -12,
    'one-raiders-scraps->minesweeper': -12,
    'three-deep-breaths->minesweeper': -12,
  };
  const defaultRadiusFudge = 4;
  const getNodeRadius = (
    size: string,
    id: string,
    category: string,
    radiusFudge?: number
  ) => {
    if (rootNodeIds.has(id)) return 0;
    const baseRadius = size === 'big' ? 28 : 14;
    const categoryDefault = category === 'conditioning' ? 0 : defaultRadiusFudge;
    const fudge = radiusFudge ?? categoryDefault;
    return baseRadius + fudge;
  };

  for (const skill of MOCK_SKILLS) {
    const skillLevel = skillLevels[skill.id] || 0;
    const isActive = skillLevel > 0;
    const colors = CATEGORY_COLORS[skill.category];

    for (const prereqId of skill.prerequisites) {
      const prereq = MOCK_SKILLS.find(s => s.id === prereqId);
      if (!prereq) continue;

      const prereqLevel = skillLevels[prereqId] || 0;
      const isConnected = prereqLevel > 0 && isActive;
      const isPrereqActive = prereqLevel > 0;

      const x1 = prereq.position.x;
      const y1 = prereq.position.y;
      const x2 = skill.position.x;
      const y2 = skill.position.y;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.hypot(dx, dy) || 1;
      const ux = dx / distance;
      const uy = dy / distance;
      const startRadius = getNodeRadius(
        prereq.size,
        prereq.id,
        prereq.category,
        prereq.lineRadiusFudge
      );
      const endRadius = getNodeRadius(
        skill.size,
        skill.id,
        skill.category,
        skill.lineRadiusFudge
      );
      const connectionKey = `${prereqId}->${skill.id}`;
      const fudge = connectionFudge[connectionKey] ?? 0;
      const startX = x1 + ux * (startRadius + fudge);
      const startY = y1 + uy * (startRadius + fudge);
      const endFudge = connectionEndFudge[connectionKey] ?? 0;
      const endX = x2 - ux * (endRadius + endFudge);
      const endY = y2 - uy * (endRadius + endFudge);

      connections.push(
        <line
          key={`${prereqId}-${skill.id}`}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={isConnected ? colors.primary : isPrereqActive ? colors.muted : '#2a2e36'}
          strokeWidth={isConnected ? 2 : 1.5}
          strokeOpacity={isConnected ? 0.7 : isPrereqActive ? 0.4 : 0.3}
          strokeLinecap="round"
          style={{
            filter: isConnected ? `drop-shadow(0 0 6px ${colors.glow})` : 'none',
            transition: 'all 0.3s ease',
          }}
        />
      );
    }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'visible',
        zIndex: 1, // Lower z-index than skill nodes
      }}
    >
      {connections}
    </svg>
  );
});
