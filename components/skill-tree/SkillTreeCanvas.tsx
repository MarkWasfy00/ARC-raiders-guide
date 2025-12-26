import { useRef, useState, useCallback, useEffect } from "react";
import {
  MOCK_SKILLS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  SkillCategory,
  ROOT_NODE,
  SKILL_TREE_CENTER,
  mapSkillPosition,
  mapTreePosition,
} from "@/lib/skillTreeData";
import { SkillNode } from "./SkillNode";
import { SkillConnections } from "./SkillConnections";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus, Minus, Hand, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTreeCanvasProps {
  skillLevels: Record<string, number>;
  expeditionPoints: number;
  totalPointsUsed: number;
  totalPointsLimit: number;
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
  totalPointsUsed,
  totalPointsLimit,
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (
        event.target === containerRef.current ||
        (event.target as HTMLElement).closest(".canvas-background")
      ) {
        setIsDragging(true);
        setDragStart({ x: event.clientX - position.x, y: event.clientY - position.y });
      }
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: event.clientX - dragStart.x,
          y: event.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(2, Math.max(0.5, prev + delta)));
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const rootSkills = {
    survival: MOCK_SKILLS.find(
      (skill) => skill.category === "survival" && skill.prerequisites.length === 0
    ),
    mobility: MOCK_SKILLS.find(
      (skill) => skill.category === "mobility" && skill.prerequisites.length === 0
    ),
    conditioning: MOCK_SKILLS.find(
      (skill) => skill.category === "conditioning" && skill.prerequisites.length === 0
    ),
  };

  const rootPosition = mapTreePosition(ROOT_NODE.position);
  const rootX = rootPosition.x + SKILL_TREE_CENTER.x;
  const rootY = rootPosition.y + SKILL_TREE_CENTER.y;

  return (
    <div className="relative w-full h-[720px] bg-[#060810] border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-[-20%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06),_transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.05),_transparent_35%),radial-gradient(circle_at_70%_20%,_rgba(255,255,255,0.05),_transparent_35%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_rgba(7,11,19,0.6),_rgba(7,11,19,1)_60%)]" />
      </div>

      <div className="absolute left-4 top-4 z-20 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Expedition Points
        </h3>
        <div className="text-4xl font-bold text-primary text-center">{expeditionPoints}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpeditionPoints(expeditionPoints + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpeditionPoints(Math.max(0, expeditionPoints - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-20 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Hand className="h-4 w-4" />
          <span>Drag to navigate</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MousePointer2 className="h-4 w-4" />
          <span>Scroll-wheel to zoom</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-green-500/30 border border-green-500" />
          <span>Left-click to learn skill</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-red-500/30 border border-red-500" />
          <span>Right-click to remove points</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20 flex items-center gap-8">
        <div className="bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-2">
          <div className="text-sm font-semibold text-foreground">
            Points Used: <span className="text-primary">{totalPointsUsed}</span> /{" "}
            {totalPointsLimit}
          </div>
          <div className="text-xs text-muted-foreground">
            Expedition Points: {expeditionPoints}
          </div>
        </div>

        <Button variant="destructive" size="sm" onClick={resetTree} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div
        ref={containerRef}
        className={cn("absolute inset-0 canvas-background", isDragging ? "cursor-grabbing" : "cursor-grab")}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04), transparent 25%)",
          backgroundSize: "28px 28px, 100% 100%",
        }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            left: "50%",
            top: "50%",
            width: "1100px",
            height: "650px",
            marginLeft: "-550px",
            marginTop: "-325px",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/5" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-white/5" />
          </div>

          <div
            className="absolute flex flex-col items-center gap-2 text-center"
            style={{
              left: rootX,
              top: rootY,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-[4px] border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.4)] flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-background shadow-[inset_0_0_18px_hsl(var(--muted)/0.6)] flex items-center justify-center text-primary">
                  <svg viewBox="0 0 64 64" className="w-7 h-7" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M28 10c5 0 9 4 9 9v5l7 3 10-2c2 0 4 2 4 4v4h-6l-6 6H35l-4 6h-7l2-8-6-7-8-1c-2-1-3-3-2-5l1-3 10 2 8-4v-4c0-5 4-9 9-9zm-6 17-6 3 4 5 6 1 3 4 2-3h9l4-4 4-2-8 1-9-4-1-1v-3l-4 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Core
            </div>
          </div>

          {Object.entries(rootSkills).map(([category, skill]) => {
            if (!skill) return null;
            const colors = CATEGORY_COLORS[category as SkillCategory];
            const points = pointsByCategory[category as SkillCategory];
            const position = mapSkillPosition(skill);
            const midX = (rootX + position.x + SKILL_TREE_CENTER.x) / 2;
            const midY = (rootY + position.y + SKILL_TREE_CENTER.y) / 2;
            const angle = Math.atan2(
              position.y + SKILL_TREE_CENTER.y - rootY,
              position.x + SKILL_TREE_CENTER.x - rootX
            );
            const offset = category === "mobility" ? 0 : 18;
            const labelX = midX + Math.cos(angle + Math.PI / 2) * offset;
            const labelY = midY + Math.sin(angle + Math.PI / 2) * offset;
            const baseRotation = (angle * 180) / Math.PI + 90;
            const rotation =
              category === "survival" || category === "conditioning"
                ? baseRotation + 180
                : baseRotation;

            return (
              <div
                key={category}
                className="absolute flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/50"
                style={{
                  left: labelX,
                  top: labelY,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: colors.primary }}
                >
                  {CATEGORY_LABELS[category as SkillCategory]}
                </span>
                <span className="text-sm font-bold" style={{ color: colors.primary }}>
                  {points}
                </span>
              </div>
            );
          })}

          <SkillConnections skillLevels={skillLevels} highlightedSkillId={hoveredSkillId} />

          {MOCK_SKILLS.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              currentLevel={getSkillLevel(skill.id)}
              canLearn={canLearnSkill(skill.id)}
              onAddPoint={() => addPoint(skill.id)}
              onRemovePoint={() => removePoint(skill.id)}
              onHover={() => setHoveredSkillId(skill.id)}
              onBlur={() => setHoveredSkillId(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
