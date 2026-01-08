import { useRef, useState, useCallback, useEffect } from 'react';
import { MOCK_SKILLS, CATEGORY_COLORS, CATEGORY_LABELS, MAX_TOTAL_POINTS, SkillCategory, getRootSkills } from '@/data/skillTreeData';
import { SkillNode } from './SkillNode';
import { SkillConnections } from './SkillConnections';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus, Minus, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillTreeCanvasProps {
  skillLevels: Record<string, number>;
  expeditionPoints: number;
  availablePoints: number;
  totalPointsUsed: number;
  pointsByCategory: Record<SkillCategory, number>;
  getSkillLevel: (skillId: string) => number;
  canLearnSkill: (skillId: string) => boolean;
  addPoint: (skillId: string) => void;
  removePoint: (skillId: string) => void;
  resetTree: () => void;
  setExpeditionPoints: (points: number) => void;
}

export function SkillTreeCanvas({
  skillLevels,
  expeditionPoints,
  availablePoints,
  totalPointsUsed,
  pointsByCategory,
  getSkillLevel,
  canLearnSkill,
  addPoint,
  removePoint,
  resetTree,
  setExpeditionPoints,
}: SkillTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 110 });
  const [scale, setScale] = useState(0.7);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.canvas-background')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => Math.min(1.5, Math.max(0.3, prev + delta)));
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const rootSkills = getRootSkills();
  const rootSkillRadius = 28;
  const rootAnchor = { x: 700, y: 760 };
  const mobilityRoot = MOCK_SKILLS.find(skill => skill.id === 'nimble-climber');
  const mobilityMid = MOCK_SKILLS.find(skill => skill.id === 'carry-the-momentum');
  const mobilityUpper = MOCK_SKILLS.find(skill => skill.id === 'slip-and-slide');
  const mobilityLabelY =
    mobilityUpper && mobilityMid
      ? (mobilityUpper.position.y + mobilityMid.position.y) / 2
      : null;
  const getEdgePoint = (
    target?: { position: { x: number; y: number } },
    radius = 0,
    targetOffset = { x: 0, y: 0 }
  ) => {
    if (!target) {
      return { x: rootAnchor.x, y: rootAnchor.y };
    }
    const targetX = target.position.x + targetOffset.x;
    const targetY = target.position.y + targetOffset.y;
    const dx = targetX - rootAnchor.x;
    const dy = targetY - rootAnchor.y;
    const distance = Math.hypot(dx, dy) || 1;
    const ux = dx / distance;
    const uy = dy / distance;
    return {
      x: targetX - ux * radius,
      y: targetY - uy * radius,
    };
  };
  const conditioningEnd = getEdgePoint(
    rootSkills.conditioning,
    rootSkillRadius + 2,
    { x: -20, y: 0 }
  );
  const mobilityEnd = getEdgePoint(rootSkills.mobility, rootSkillRadius - 9.5);
  const survivalEnd = getEdgePoint(rootSkills.survival, rootSkillRadius -7.5);

  return (
    <div className="relative w-full flex flex-col rounded-lg overflow-hidden border border-white/10" style={{ backgroundColor: '#0c0e11' }}>
      {/* Top Control Bar - Expedition Points & Instructions */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10" style={{ backgroundColor: '#080a0d' }}>
        {/* Left - Expedition Points */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#13161b' }}>
          <span className="text-[11px] font-medium text-white/50 uppercase tracking-widest">
            Expedition Points
          </span>
          <span className="text-xl font-bold text-white tabular-nums min-w-[1.5ch]">
            {expeditionPoints}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setExpeditionPoints(Math.max(0, expeditionPoints - 1))}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
              onClick={() => setExpeditionPoints(expeditionPoints + 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right - Instructions */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-amber-500/70 text-sm">🖐</span>
            <span className="text-[11px] text-white/40 uppercase tracking-widest">Drag to navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-sm">⊙</span>
            <span className="text-[11px] text-white/40 uppercase tracking-widest">Scroll-wheel to zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400/70 text-sm">✦</span>
            <span className="text-[11px] text-white/40 uppercase tracking-widest">Left-click to learn skill</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-rose-400/70 text-sm">✦</span>
            <span className="text-[11px] text-white/40 uppercase tracking-widest">Right-click to remove points</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative h-[700px]">
        {/* Canvas Header - Points Used & Buttons */}
        <div className="absolute left-5 top-4 z-20">
          <div className="text-sm font-medium text-white/70 uppercase tracking-wider">
            Points Used <span className="text-amber-400 font-bold">{totalPointsUsed}</span>
            <span className="text-white/40"> / {availablePoints}</span>
          </div>
          <div className="text-xs text-amber-400/60 uppercase tracking-wider mt-0.5">
            Expedition Points <span className="font-semibold">{expeditionPoints}</span>
          </div>
        </div>

        <div className="absolute right-5 top-4 z-20 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[11px] h-8 text-white/50 hover:text-white hover:bg-white/10 uppercase tracking-wider"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTree}
            className="gap-2 text-[11px] h-8 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 uppercase tracking-wider"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        {/* Draggable Canvas */}
        <div
          ref={containerRef}
          className={cn(
            'absolute inset-0 canvas-background',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Transformed Content */}
          <div
            className="absolute"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              left: '50%',
              top: '50%',
              width: '1400px',
              height: '900px',
              marginLeft: '-700px',
              marginTop: '-450px',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Branch trunk lines from center bottom to root skills */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 0 }}
            >
              <defs>
                {/* Conditioning gradient - Green */}
                <linearGradient id="conditioningTrunk" x1="0.5" y1="1" x2="0.3" y2="0">
                  <stop offset="0%" stopColor={CATEGORY_COLORS.conditioning.primary} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={CATEGORY_COLORS.conditioning.primary} stopOpacity="0.3" />
                </linearGradient>
                {/* Mobility gradient - Yellow */}
                <linearGradient id="mobilityTrunk" x1="0.5" y1="1" x2="0.5" y2="0">
                  <stop offset="0%" stopColor={CATEGORY_COLORS.mobility.primary} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={CATEGORY_COLORS.mobility.primary} stopOpacity="0.3" />
                </linearGradient>
                {/* Survival gradient - Red */}
                <linearGradient id="survivalTrunk" x1="0.5" y1="1" x2="0.7" y2="0">
                  <stop offset="0%" stopColor={CATEGORY_COLORS.survival.primary} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={CATEGORY_COLORS.survival.primary} stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {/* Central merge point at bottom */}
              <circle cx={rootAnchor.x} cy={rootAnchor.y} r="6" fill="#1a1d24" stroke="#3a3f4a" strokeWidth="2" />
              
              {/* Conditioning trunk - curves to upper-left */}
              <path
                d={`M ${rootAnchor.x} ${rootAnchor.y} 
                    C ${rootAnchor.x} ${rootAnchor.y - 20}, 600 720, ${conditioningEnd.x} ${conditioningEnd.y}`}
                fill="none"
                stroke="url(#conditioningTrunk)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              
              {/* Mobility trunk - goes straight up */}
              <path
                d={`M ${rootAnchor.x} ${rootAnchor.y} 
                    L ${mobilityEnd.x} ${mobilityEnd.y}`}
                fill="none"
                stroke="url(#mobilityTrunk)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Explicit root-to-nimble line */}
              <line
                x1={rootAnchor.x}
                y1={rootAnchor.y}
                x2={mobilityEnd.x}
                y2={mobilityEnd.y}
                stroke={CATEGORY_COLORS.mobility.primary}
                strokeWidth="13"
                strokeLinecap="round"
                opacity="0.9"
              />
              
              {/* Survival trunk - curves to upper-right */}
              <path
                d={`M ${rootAnchor.x} ${rootAnchor.y} 
                    C ${rootAnchor.x} ${rootAnchor.y - 20}, 800 720, ${survivalEnd.x} ${survivalEnd.y}`}
                fill="none"
                stroke="url(#survivalTrunk)"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </svg>

            {/* Branch Labels */}
            {Object.entries(rootSkills).map(([category, skill]) => {
              if (!skill) return null;
              const colors = CATEGORY_COLORS[category as SkillCategory];

              const labelXOffset =
                category === 'conditioning'
                  ? -10
                  : category === 'survival'
                    ? 10
                    : 0;
              const labelYOffset =
                category === 'mobility'
                  ? 0
                  : category === 'conditioning' || category === 'survival'
                    ? 10
                    : 0;
              const labelTop =
                category === 'mobility' && mobilityLabelY !== null
                  ? mobilityLabelY + labelYOffset
                  : skill.position.y + 60 + labelYOffset;
              return (
                <div
                  key={category}
                  className="absolute pointer-events-none"
                  style={{
                    left: skill.position.x + labelXOffset,
                    top: labelTop,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <span
                    className="block text-sm font-bold uppercase tracking-[0.15em] leading-tight"
                    style={{ color: colors.primary, fontSize: '21px', textAlign: 'center' }}
                  >
                    {CATEGORY_LABELS[category as SkillCategory]}
                    <br />
                    {pointsByCategory[category as SkillCategory]}
                  </span>
                </div>
              );
            })}

            {/* Skill Connections - behind nodes */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <SkillConnections skillLevels={skillLevels} />
            </div>

            {/* Skill Nodes - above connections */}
            <div className="absolute inset-0 z-10">
              {MOCK_SKILLS.map(skill => (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  currentLevel={getSkillLevel(skill.id)}
                  canLearn={canLearnSkill(skill.id)}
                  hasPointsLeft={totalPointsUsed < availablePoints}
                  onAddPoint={() => addPoint(skill.id)}
                  onRemovePoint={() => removePoint(skill.id)}
                  categoryPoints={pointsByCategory[skill.category]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
