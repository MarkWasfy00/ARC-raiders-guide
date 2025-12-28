import { memo } from "react";
import {
  MOCK_SKILLS,
  CATEGORY_COLORS,
  ROOT_NODE,
  SKILL_TREE_CENTER,
  SKILL_TREE_RADIUS,
  mapSkillPosition,
  mapTreePosition,
} from "@/lib/skillTreeData";

interface SkillConnectionsProps {
  skillLevels: Record<string, number>;
  highlightedSkillId?: string | null;
}

export const SkillConnections = memo(function SkillConnections({
  skillLevels,
  highlightedSkillId,
}: SkillConnectionsProps) {
  const connections: JSX.Element[] = [];
  const highlightedEdges = new Set<string>();
  const hoveredSkillLevel = highlightedSkillId ? skillLevels[highlightedSkillId] || 0 : 0;
  const hoveredIsLearned = hoveredSkillLevel > 0;

  if (highlightedSkillId) {
    const skillById = new Map(MOCK_SKILLS.map((skill) => [skill.id, skill]));
    const visited = new Set<string>();

    const walkToRoot = (skillId: string) => {
      if (visited.has(skillId)) return;
      visited.add(skillId);
      const skill = skillById.get(skillId);
      if (!skill) return;

      if (skill.prerequisites.length === 0) {
        highlightedEdges.add(`root->${skill.id}`);
        return;
      }

      for (const prereqId of skill.prerequisites) {
        highlightedEdges.add(`${prereqId}->${skill.id}`);
        walkToRoot(prereqId);
      }
    };

    walkToRoot(highlightedSkillId);
  }

  const buildPath = (x1: number, y1: number, x2: number, y2: number) => {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`;
  };

  const getStrokeWidth = (distance: number, isRootConnection: boolean) => {
    if (isRootConnection) return 5;
    const normalized = Math.min(1, Math.max(0, distance / SKILL_TREE_RADIUS));
    return Math.max(2, 5 - normalized * 2.5);
  };

  const rootPosition = mapTreePosition(ROOT_NODE.position);
  const rootX = rootPosition.x + SKILL_TREE_CENTER.x;
  const rootY = rootPosition.y + SKILL_TREE_CENTER.y;

  const rootSkills = MOCK_SKILLS.filter(
    (skill) => skill.prerequisites.length === 0
  );

  for (const skill of rootSkills) {
    const skillLevel = skillLevels[skill.id] || 0;
    const isConnected = skillLevel > 0;
    const isHighlighted = highlightedEdges.has(`root->${skill.id}`);
    const colors = CATEGORY_COLORS[skill.category];
    const skillPosition = mapSkillPosition(skill);
    const x2 = skillPosition.x + SKILL_TREE_CENTER.x;
    const y2 = skillPosition.y + SKILL_TREE_CENTER.y;
    const pathD = buildPath(rootX, rootY, x2, y2);
    const distance = Math.hypot(skill.position.x, skill.position.y);
    const strokeWidth = getStrokeWidth(distance, true);

    const showRootConnection = Boolean(highlightedSkillId) && isHighlighted;

    connections.push(
      <path
        key={`root-${skill.id}`}
        d={pathD}
        fill="none"
        stroke={
          showRootConnection
            ? hoveredIsLearned
              ? colors.primary
              : "hsl(var(--muted-foreground) / 0.7)"
            : "transparent"
        }
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={showRootConnection ? 0.95 : 0}
        style={{
          filter: showRootConnection && hoveredIsLearned ? `drop-shadow(0 0 12px ${colors.primary}85)` : "none",
          transition: "all 0.3s ease",
        }}
      />
    );
  }

  for (const skill of MOCK_SKILLS) {
    const skillLevel = skillLevels[skill.id] || 0;
    const isActive = skillLevel > 0;
    const colors = CATEGORY_COLORS[skill.category];

    for (const prereqId of skill.prerequisites) {
      const prereq = MOCK_SKILLS.find((entry) => entry.id === prereqId);
      if (!prereq) continue;

      const prereqLevel = skillLevels[prereqId] || 0;
      const isConnected = prereqLevel > 0 && isActive;
      const isHighlighted = highlightedEdges.has(`${prereqId}->${skill.id}`);

      const prereqPosition = mapSkillPosition(prereq);
      const skillPosition = mapSkillPosition(skill);
      const x1 = prereqPosition.x + SKILL_TREE_CENTER.x;
      const y1 = prereqPosition.y + SKILL_TREE_CENTER.y;
      const x2 = skillPosition.x + SKILL_TREE_CENTER.x;
      const y2 = skillPosition.y + SKILL_TREE_CENTER.y;

      const pathD = buildPath(x1, y1, x2, y2);
      const avgDistance = Math.hypot(
        (prereq.position.x + skill.position.x) / 2,
        (prereq.position.y + skill.position.y) / 2
      );
      const strokeWidth = getStrokeWidth(avgDistance, false);

      const showConnection = Boolean(highlightedSkillId) && isHighlighted;

      connections.push(
        <path
          key={`${prereqId}-${skill.id}`}
          d={pathD}
          fill="none"
          stroke={
            showConnection
              ? hoveredIsLearned
                ? colors.primary
                : "hsl(var(--muted-foreground) / 0.7)"
              : "transparent"
          }
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={showConnection ? 0.95 : 0}
          style={{
            filter: showConnection && hoveredIsLearned ? `drop-shadow(0 0 10px ${colors.primary}85)` : "none",
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
