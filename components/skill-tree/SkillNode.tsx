import { memo } from "react";
import { Skill, CATEGORY_COLORS, mapSkillPosition } from "@/lib/skillTreeData";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Shield, Zap, Leaf, Lock } from "lucide-react";

interface SkillNodeProps {
  skill: Skill;
  currentLevel: number;
  canLearn: boolean;
  onAddPoint: () => void;
  onRemovePoint: () => void;
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
}: SkillNodeProps) {
  const isLearned = currentLevel > 0;
  const isMaxed = currentLevel >= skill.maxLevel;
  const isLocked = !canLearn && !isLearned;
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
            isLocked && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          style={{
            position: "absolute",
            left: position.x + 500,
            top: position.y + 50,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              "border-[3px] shadow-[0_0_30px_rgba(0,0,0,0.25)]",
              isLearned && "scale-105 shadow-[0_0_30px_rgba(0,0,0,0.45)]"
            )}
            style={{
              borderColor: isLearned ? colors.primary : "hsl(var(--muted-foreground) / 0.4)",
              background: isLearned
                ? `radial-gradient(circle at 30% 30%, ${colors.primary}40, ${colors.bg})`
                : "linear-gradient(135deg, hsl(var(--muted) / 0.2), hsl(var(--muted) / 0.05))",
              boxShadow: isLearned ? `0 0 24px ${colors.primary}50` : "none",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: isLearned ? `0 0 60px ${colors.primary}40` : "none",
              }}
            />
            <div
              style={{
                color: isLearned ? colors.primary : "hsl(var(--muted-foreground))",
              }}
            >
              <CategoryIcon category={skill.category} />
            </div>

            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>

          <div
            className="text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide transition-colors duration-300"
            style={{
              color: isLearned ? colors.primary : "hsl(var(--muted-foreground))",
              backgroundColor: isLearned ? `${colors.primary}18` : "hsl(var(--muted) / 0.08)",
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
