import { memo } from "react";
import { Skill, CATEGORY_COLORS, SKILL_TREE_CENTER, mapSkillPosition } from "@/lib/skillTreeData";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Shield, Zap, Leaf } from "lucide-react";

interface SkillNodeProps {
  skill: Skill;
  currentLevel: number;
  canLearn: boolean;
  onAddPoint: () => void;
  onRemovePoint: () => void;
  onHover?: () => void;
  onBlur?: () => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "conditioning":
      return <Shield className="w-6 h-6" />;
    case "mobility":
      return <Zap className="w-6 h-6" />;
    case "survival":
      return <Leaf className="w-6 h-6" />;
    default:
      return null;
  }
};

export const SkillNode = memo(function SkillNode({
  skill,
  currentLevel,
  canLearn,
  onAddPoint,
  onRemovePoint,
  onHover,
  onBlur,
}: SkillNodeProps) {
  const isLearned = currentLevel > 0;
  const isMaxed = currentLevel >= skill.maxLevel;
  const isUnlocked = canLearn && !isLearned;
  const isLocked = !canLearn && !isLearned;
  const isGate = skill.maxLevel === 1;
  const colors = CATEGORY_COLORS[skill.category];
  const position = mapSkillPosition(skill);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (canLearn && !isMaxed) {
      onAddPoint();
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentLevel > 0) {
      onRemovePoint();
    }
  };

  return (
    <HoverCard openDelay={100} closeDelay={50}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "flex flex-col items-center gap-2 cursor-pointer select-none transition-all duration-300",
            isLocked && "opacity-60 grayscale cursor-not-allowed"
          )}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseEnter={onHover}
          onMouseLeave={onBlur}
          style={{
            position: "absolute",
            left: position.x + SKILL_TREE_CENTER.x,
            top: position.y + SKILL_TREE_CENTER.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative flex items-center justify-center">
            <div
              className={cn(
                "flex items-center justify-center rounded-full transition-all duration-300",
                "w-16 h-16 border-[3px]",
                isLearned && "scale-105",
                isMaxed && "skill-node-maxed",
                isGate && isLearned && "skill-node-gate"
              )}
              style={{
                borderColor: isLearned
                  ? colors.primary
                  : isUnlocked
                  ? "hsl(var(--muted-foreground) / 0.55)"
                  : "hsl(var(--muted-foreground) / 0.25)",
                color: colors.primary,
                boxShadow: isLearned
                  ? `0 0 22px ${colors.primary}60`
                  : "0 0 0 transparent",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full w-10 h-10"
                style={{
                  backgroundColor: "hsl(var(--background))",
                  boxShadow: "inset 0 0 12px hsl(var(--muted) / 0.6)",
                }}
              >
                <div
                  style={{
                    color: isLearned || isUnlocked
                      ? colors.primary
                      : "hsl(var(--muted-foreground) / 0.7)",
                  }}
                >
                  <CategoryIcon category={skill.category} />
                </div>
              </div>
            </div>
          </div>

          <div
            className="text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide transition-colors duration-300"
            style={{
              color: isLearned || isUnlocked ? colors.primary : "hsl(var(--muted-foreground))",
              backgroundColor: isLearned ? `${colors.primary}12` : "hsl(var(--muted) / 0.08)",
              border: `1px solid ${isLearned ? colors.primary : "hsl(var(--border))"}`,
            }}
          >
            {currentLevel} / {skill.maxLevel}
          </div>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        className="w-64 bg-card/95 backdrop-blur-sm border-border/50"
        sideOffset={10}
      >
        <div className="space-y-2">
          <h4
            className="font-bold uppercase tracking-wide text-sm"
            style={{ color: colors.primary }}
          >
            {skill.name}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {skill.description}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Level: {currentLevel} / {skill.maxLevel}
            </span>
            {isLocked && <span className="text-xs text-destructive">Locked</span>}
            {isMaxed && (
              <span className="text-xs" style={{ color: colors.primary }}>
                Maxed
              </span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});
