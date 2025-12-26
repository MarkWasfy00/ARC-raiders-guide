import { memo } from "react";
import { MOCK_SKILLS, CATEGORY_COLORS, mapSkillPosition } from "@/lib/skillTreeData";

interface SkillConnectionsProps {
  skillLevels: Record<string, number>;
}

export const SkillConnections = memo(function SkillConnections({
  skillLevels,
}: SkillConnectionsProps) {
  const connections: JSX.Element[] = [];

  const buildPath = (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const curve = Math.max(30, Math.min(120, Math.abs(x1 - x2) * 0.4 + Math.abs(y1 - y2) * 0.3));
    const controlY = midY - curve;
    return `M ${x1} ${y1} Q ${midX} ${controlY} ${x2} ${y2}`;
  };

  for (const skill of MOCK_SKILLS) {
    const skillLevel = skillLevels[skill.id] || 0;
    const isActive = skillLevel > 0;
    const colors = CATEGORY_COLORS[skill.category];

    for (const prereqId of skill.prerequisites) {
      const prereq = MOCK_SKILLS.find((entry) => entry.id === prereqId);
      if (!prereq) continue;

      const prereqLevel = skillLevels[prereqId] || 0;
      const isConnected = prereqLevel > 0 && isActive;

      const prereqPosition = mapSkillPosition(prereq);
      const skillPosition = mapSkillPosition(skill);
      const x1 = prereqPosition.x + 500;
      const y1 = prereqPosition.y + 50;
      const x2 = skillPosition.x + 500;
      const y2 = skillPosition.y + 50;

      const pathD = buildPath(x1, y1, x2, y2);

      connections.push(
        <path
          key={`${prereqId}-${skill.id}`}
          d={pathD}
          fill="none"
          stroke={isConnected ? colors.primary : "hsl(var(--muted-foreground) / 0.25)"}
          strokeWidth={isConnected ? 4 : 2}
          strokeLinecap="round"
          style={{
            filter: isConnected ? `drop-shadow(0 0 8px ${colors.primary}60)` : "none",
            transition: "all 0.3s ease",
          }}
        />
      );
    }
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }}>
      {connections}
    </svg>
  );
});
