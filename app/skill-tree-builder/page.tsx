'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Hand,
  Mouse,
  MousePointer2,
  RotateCcw,
  Star,
  StarOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SkillCategory = 'Conditioning' | 'Mobility' | 'Survival';

type SkillPrerequisite = {
  id: string;
  minLevel: number;
};

type SkillNode = {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  currentLevel: number;
  prerequisites: SkillPrerequisite[];
  position: { x: number; y: number };
  isRoot?: boolean;
};

const STORAGE_KEY = 'arc-skill-tree';
const TOTAL_POINTS = 76;

const categoryStyles: Record<
  SkillCategory,
  { text: string; border: string; soft: string; solid: string }
> = {
  Conditioning: {
    text: 'text-red-400',
    border: 'border-red-400/70',
    soft: 'bg-red-500/10',
    solid: 'bg-red-500',
  },
  Mobility: {
    text: 'text-blue-400',
    border: 'border-blue-400/70',
    soft: 'bg-blue-500/10',
    solid: 'bg-blue-500',
  },
  Survival: {
    text: 'text-green-400',
    border: 'border-green-400/70',
    soft: 'bg-green-500/10',
    solid: 'bg-green-500',
  },
};

const initialSkills: SkillNode[] = [
  {
    id: 'cond-weight',
    name: 'Used to the Weight',
    description: "Wearing a shield doesn't slow you down as much.",
    category: 'Conditioning',
    maxLevel: 5,
    currentLevel: 0,
    prerequisites: [],
    position: { x: 140, y: 120 },
    isRoot: true,
  },
  {
    id: 'cond-blast',
    name: 'Blast-Born',
    description: 'Reduce explosive damage taken while sprinting.',
    category: 'Conditioning',
    maxLevel: 5,
    currentLevel: 0,
    prerequisites: [{ id: 'cond-weight', minLevel: 1 }],
    position: { x: 140, y: 260 },
  },
  {
    id: 'cond-stamina',
    name: "Survivor's Stamina",
    description: 'Faster stamina regeneration when hurt.',
    category: 'Conditioning',
    maxLevel: 3,
    currentLevel: 0,
    prerequisites: [{ id: 'cond-blast', minLevel: 2 }],
    position: { x: 140, y: 400 },
  },
  {
    id: 'mob-marathon',
    name: 'Marathon Runner',
    description: 'Increase sprint duration before exhaustion.',
    category: 'Mobility',
    maxLevel: 5,
    currentLevel: 0,
    prerequisites: [],
    position: { x: 460, y: 120 },
    isRoot: true,
  },
  {
    id: 'mob-momentum',
    name: 'Carry the Momentum',
    description: 'Free sprinting after dodge rolls.',
    category: 'Mobility',
    maxLevel: 3,
    currentLevel: 0,
    prerequisites: [{ id: 'mob-marathon', minLevel: 1 }],
    position: { x: 460, y: 260 },
  },
  {
    id: 'mob-climber',
    name: 'Nimble Climber',
    description: 'Faster climb speed while carrying loot.',
    category: 'Mobility',
    maxLevel: 5,
    currentLevel: 0,
    prerequisites: [{ id: 'mob-momentum', minLevel: 2 }],
    position: { x: 460, y: 400 },
  },
  {
    id: 'surv-craft',
    name: 'In-Round Crafting',
    description: 'Craft during raids with fewer materials.',
    category: 'Survival',
    maxLevel: 3,
    currentLevel: 0,
    prerequisites: [],
    position: { x: 780, y: 120 },
    isRoot: true,
  },
  {
    id: 'surv-breach',
    name: 'Security Breach',
    description: 'Unlock high-tier loot containers.',
    category: 'Survival',
    maxLevel: 1,
    currentLevel: 0,
    prerequisites: [{ id: 'surv-craft', minLevel: 1 }],
    position: { x: 780, y: 260 },
  },
  {
    id: 'surv-mine',
    name: 'Minesweeper',
    description: 'Defuse deployables with reduced noise.',
    category: 'Survival',
    maxLevel: 3,
    currentLevel: 0,
    prerequisites: [{ id: 'surv-breach', minLevel: 1 }],
    position: { x: 780, y: 400 },
  },
];

type StoredSkillState = {
  expeditionPoints: number;
  levels: Record<string, number>;
};

export default function SkillTreeBuilderPage() {
  const [favorited, setFavorited] = useState(false);
  const [expeditionPoints, setExpeditionPoints] = useState(0);
  const [skills, setSkills] = useState<SkillNode[]>(initialSkills);
  const [hovered, setHovered] = useState<SkillNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const pointsUsed = useMemo(
    () => skills.reduce((sum, skill) => sum + skill.currentLevel, 0),
    [skills]
  );

  const categoryPoints = useMemo(() => {
    return skills.reduce<Record<SkillCategory, number>>(
      (acc, skill) => {
        acc[skill.category] += skill.currentLevel;
        return acc;
      },
      { Conditioning: 0, Mobility: 0, Survival: 0 }
    );
  }, [skills]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as StoredSkillState;
      if (typeof parsed.expeditionPoints === 'number' && parsed.levels) {
        setExpeditionPoints(parsed.expeditionPoints);
        setSkills((prev) =>
          prev.map((skill) => ({
            ...skill,
            currentLevel: Math.min(
              skill.maxLevel,
              Math.max(0, parsed.levels[skill.id] ?? skill.currentLevel)
            ),
          }))
        );
      }
    } catch {
      // Ignore invalid stored data.
    }
  }, []);

  useEffect(() => {
    const payload: StoredSkillState = {
      expeditionPoints,
      levels: skills.reduce<Record<string, number>>((acc, skill) => {
        acc[skill.id] = skill.currentLevel;
        return acc;
      }, {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [expeditionPoints, skills]);

  const updateSkillLevel = (id: string, nextLevel: number) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, currentLevel: nextLevel } : skill))
    );
  };

  const isLocked = (skill: SkillNode) => {
    return skill.prerequisites.some((req) => {
      const prereq = skills.find((node) => node.id === req.id);
      if (!prereq) return true;
      return prereq.currentLevel < req.minLevel;
    });
  };

  const handleIncrease = (skill: SkillNode) => {
    if (isLocked(skill)) return;
    if (pointsUsed >= expeditionPoints) return;
    if (skill.currentLevel >= skill.maxLevel) return;
    updateSkillLevel(skill.id, skill.currentLevel + 1);
  };

  const handleDecrease = (skill: SkillNode) => {
    if (skill.currentLevel <= 0) return;
    updateSkillLevel(skill.id, skill.currentLevel - 1);
  };

  const handleReset = () => {
    setSkills((prev) => prev.map((skill) => ({ ...skill, currentLevel: 0 })));
    setExpeditionPoints(0);
  };

  const startPan = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    setIsPanning(true);
    panStart.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
  };

  const updatePan = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPan({ x: event.clientX - panStart.current.x, y: event.clientY - panStart.current.y });
  };

  const stopPan = () => setIsPanning(false);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.min(1.6, Math.max(0.6, prev + delta)));
  };

  const selectedSkills = useMemo(() => skills.filter((skill) => skill.currentLevel > 0), [skills]);

  const groupedSelected = useMemo(() => {
    return selectedSkills.reduce<Record<SkillCategory, SkillNode[]>>(
      (acc, skill) => {
        acc[skill.category].push(skill);
        return acc;
      },
      { Conditioning: [], Mobility: [], Survival: [] }
    );
  }, [selectedSkills]);

  const groupedAll = useMemo(() => {
    return skills.reduce<Record<SkillCategory, SkillNode[]>>(
      (acc, skill) => {
        acc[skill.category].push(skill);
        return acc;
      },
      { Conditioning: [], Mobility: [], Survival: [] }
    );
  }, [skills]);

  const skillById = useMemo(
    () =>
      skills.reduce<Record<string, SkillNode>>((acc, skill) => {
        acc[skill.id] = skill;
        return acc;
      }, {}),
    [skills]
  );

  return (
    <main className="min-h-screen">
      <div className="w-full px-[100px] py-8 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Skill Tree Builder</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border/70 rounded-full px-3 py-1 bg-muted/40">
              <Link href="/" className="hover:text-foreground transition-colors">
                Arc Raiders
              </Link>
              <span className="text-border">&gt;</span>
              <span className="text-foreground font-semibold">Skill Builder</span>
            </div>
          </div>
          <button
            onClick={() => setFavorited((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors shadow-sm',
              favorited
                ? 'border-primary/70 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-foreground hover:border-primary/60'
            )}
          >
            {favorited ? <Star className="w-4 h-4 fill-primary text-primary" /> : <StarOff className="w-4 h-4" />}
            {favorited ? 'Added to favourite' : 'Add to favourite'}
          </button>
        </div>

        <section className="rounded-2xl border border-border bg-card/60 p-4 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr_220px] gap-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col items-center gap-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Expedition Points
              </div>
              <div className="text-4xl font-bold text-foreground">{expeditionPoints}</div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setExpeditionPoints((prev) => prev + 1)}
                  className="rounded-full border border-border bg-background/80 px-3 py-2 text-sm font-semibold hover:border-primary/60"
                >
                  + Add Point
                </button>
                <button
                  type="button"
                  onClick={() => setExpeditionPoints((prev) => Math.max(pointsUsed, prev - 1))}
                  className="rounded-full border border-border bg-background/80 px-3 py-2 text-sm font-semibold hover:border-primary/60"
                >
                  - Remove Point
                </button>
              </div>
            </div>

            <div className="relative rounded-xl border border-border bg-background/50 overflow-hidden">
              <div className="absolute left-4 top-4 z-20 flex flex-col gap-1">
                <div className="text-sm font-semibold text-foreground">Points Used: {pointsUsed} / {TOTAL_POINTS}</div>
                <div className="text-xs text-muted-foreground">Expedition Points: {expeditionPoints}</div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-red-600"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Tree
              </button>

              <div
                className="relative h-[540px] w-full cursor-grab overflow-hidden"
                onMouseDown={startPan}
                onMouseMove={updatePan}
                onMouseUp={stopPan}
                onMouseLeave={stopPan}
                onWheel={handleWheel}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                  }}
                >
                  <svg className="absolute left-0 top-0 h-full w-full" aria-hidden>
                    {skills.map((skill) =>
                      skill.prerequisites.map((req) => {
                        const from = skillById[req.id];
                        if (!from) return null;
                        const isActive = from.currentLevel >= req.minLevel && skill.currentLevel > 0;
                        return (
                          <line
                            key={`${from.id}-${skill.id}`}
                            x1={from.position.x + 24}
                            y1={from.position.y + 24}
                            x2={skill.position.x + 24}
                            y2={skill.position.y + 24}
                            stroke={isActive ? '#22c55e' : '#64748b'}
                            strokeWidth={2}
                            strokeDasharray={isActive ? '0' : '6 6'}
                          />
                        );
                      })
                    )}
                  </svg>

                  {skills.map((skill) => {
                    const locked = isLocked(skill);
                    const learned = skill.currentLevel > 0;
                    const styles = categoryStyles[skill.category];
                    return (
                      <div
                        key={skill.id}
                        className="absolute flex flex-col items-center"
                        style={{ left: skill.position.x, top: skill.position.y }}
                      >
                        {skill.isRoot && (
                          <div className="absolute -left-12 top-2 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold text-muted-foreground border border-border">
                            {categoryPoints[skill.category]} pts
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleIncrease(skill)}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            handleDecrease(skill);
                          }}
                          onMouseEnter={() => setHovered(skill)}
                          onMouseMove={(event) => setHoverPos({ x: event.clientX, y: event.clientY })}
                          onMouseLeave={() => setHovered(null)}
                          className={cn(
                            'h-12 w-12 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all',
                            learned ? styles.border : 'border-muted-foreground/50',
                            learned ? styles.soft : 'bg-muted/30',
                            locked && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <span className={cn('text-lg', learned ? styles.text : 'text-muted-foreground')}>
                            {skill.name.split(' ')[0].slice(0, 1)}
                          </span>
                        </button>
                        <div
                          className={cn(
                            'mt-2 text-xs font-semibold',
                            learned ? styles.text : 'text-muted-foreground'
                          )}
                        >
                          {skill.currentLevel} / {skill.maxLevel}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hovered && (
                  <div
                    className="pointer-events-none absolute z-30 w-64 rounded-xl border border-border bg-card/95 p-3 shadow-xl"
                    style={{ left: hoverPos.x + 16, top: hoverPos.y + 16 }}
                  >
                    <div className="text-sm font-semibold text-foreground">{hovered.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{hovered.description}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Instructions
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4" />
                  Drag to navigate
                </div>
                <div className="flex items-center gap-2">
                  <Mouse className="h-4 w-4" />
                  Scroll-wheel to zoom
                </div>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4 text-green-400" />
                  Left-click to learn skill
                </div>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4 text-red-400" />
                  Right-click to remove points
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Selected Skills</h2>
            <span className="text-sm text-muted-foreground">Level: {pointsUsed} / {TOTAL_POINTS}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Conditioning', 'Mobility', 'Survival'] as SkillCategory[]).map((category) => (
              <div key={category} className="space-y-3">
                <div className={cn('text-sm font-semibold uppercase tracking-wide', categoryStyles[category].text)}>
                  {category}
                </div>
                {groupedSelected[category].length === 0 ? (
                  <div className="text-sm text-muted-foreground">No skills selected yet.</div>
                ) : (
                  groupedSelected[category].map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                    >
                      <div className="text-xs font-semibold text-foreground uppercase">{skill.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Level: {skill.currentLevel} / {skill.maxLevel}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-foreground">ARC Raiders Skill Tree</h2>
          <p className="text-sm text-muted-foreground">
            Plan and optimize your ARC Raiders character with our interactive skill tree builder. Choose from three
            distinct skill branches: Conditioning, Mobility, and Survival.
          </p>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Key Skills to Consider</h3>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div>Survivor's Stamina - Faster stamina regen when hurt</div>
              <div>Carry the Momentum - Free sprinting after dodge rolls</div>
              <div>Security Breach - Unlock high-tier loot</div>
              <div>Minesweeper - Defuse deployables</div>
              <div>In-Round Crafting - Craft during raids</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your builds with the community. Experiment with different combinations to find the perfect build.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground">All Available Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Conditioning', 'Mobility', 'Survival'] as SkillCategory[]).map((category) => (
              <div key={category} className="space-y-3">
                <div className={cn('text-sm font-semibold uppercase tracking-wide', categoryStyles[category].text)}>
                  {category} Skills
                </div>
                {groupedAll[category].map((skill) => (
                  <div key={skill.id} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <div className="text-xs font-semibold text-foreground uppercase">{skill.name}</div>
                    <div className="text-xs text-muted-foreground">{skill.description}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
