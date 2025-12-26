import { useRef, useState, useCallback, useEffect } from "react";
import {
  MOCK_SKILLS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MAX_TOTAL_POINTS,
  SkillCategory,
  mapSkillPosition,
} from "@/lib/skillTreeData";
import { SkillNode } from "./SkillNode";
import { SkillConnections } from "./SkillConnections";
import { Button } from "@/components/ui/button";
import { RotateCcw, Plus, Minus, Hand, MousePointer2, Orbit } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTreeCanvasProps {
  skillLevels: Record<string, number>;
  expeditionPoints: number;
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const canvasCenter = { x: 500, y: 260 };

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
            {MAX_TOTAL_POINTS}
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
            marginTop: "-200px",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/5" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full border border-white/5" />
          </div>

          <div
            className="absolute flex flex-col items-center gap-1 text-center"
            style={{
              left: canvasCenter.x,
              top: canvasCenter.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="rounded-full border-[3px] flex items-center justify-center shadow-[0_0_35px_rgba(0,0,0,0.5)]"
              style={{
                width: "72px",
                height: "72px",
                borderColor: "hsl(var(--primary))",
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
                boxShadow: "0 0 40px rgba(255,255,255,0.2)",
              }}
            >
              <Orbit className="w-8 h-8 text-primary" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Core Link
            </div>
          </div>

          {Object.entries(rootSkills).map(([category, skill]) => {
            if (!skill) return null;
            const colors = CATEGORY_COLORS[category as SkillCategory];
            const points = pointsByCategory[category as SkillCategory];
            const position = mapSkillPosition(skill);

            const startX = canvasCenter.x;
            const startY = canvasCenter.y;
            const endX = position.x + 500;
            const endY = position.y + 50;

            return (
              <svg key={`${category}-stem`} className="absolute inset-0 pointer-events-none">
                <path
                  d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 120} ${endX} ${endY}`}
                  fill="none"
                  stroke={`${colors.primary}60`}
                  strokeWidth={10}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 18px ${colors.primary}50)` }}
                />
              </svg>
            );
          })}

          {Object.entries(rootSkills).map(([category, skill]) => {
            if (!skill) return null;
            const colors = CATEGORY_COLORS[category as SkillCategory];
            const points = pointsByCategory[category as SkillCategory];
            const position = mapSkillPosition(skill);

            return (
              <div
                key={category}
                className="absolute flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/50"
                style={{
                  left: position.x + 500 - 40,
                  top: position.y + 50 - 60,
                  transform: "translateX(-50%)",
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

          <SkillConnections skillLevels={skillLevels} />

          {MOCK_SKILLS.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              currentLevel={getSkillLevel(skill.id)}
              canLearn={canLearnSkill(skill.id)}
              onAddPoint={() => addPoint(skill.id)}
              onRemovePoint={() => removePoint(skill.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
