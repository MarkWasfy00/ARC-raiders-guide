"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MOCK_SKILLS, SkillCategory, MAX_TOTAL_POINTS } from "@/lib/skillTreeData";

const STORAGE_KEY = "arc-raiders-skill-tree";

interface SkillTreeState {
  skillLevels: Record<string, number>;
  expeditionPoints: number;
}

const getInitialState = (): SkillTreeState => {
  if (typeof window === "undefined") {
    return {
      skillLevels: {},
      expeditionPoints: 0,
    };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load skill tree state:", error);
  }

  return {
    skillLevels: {},
    expeditionPoints: 0,
  };
};

export function useSkillTree() {
  const [state, setState] = useState<SkillTreeState>(getInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save skill tree state:", error);
    }
  }, [state]);

  const getSkillLevel = useCallback(
    (skillId: string) => {
      return state.skillLevels[skillId] || 0;
    },
    [state.skillLevels]
  );

  const canLearnSkill = useCallback(
    (skillId: string) => {
      const skill = MOCK_SKILLS.find((s) => s.id === skillId);
      if (!skill) return false;

      const currentLevel = getSkillLevel(skillId);
      if (currentLevel >= skill.maxLevel) return false;

      for (const prereqId of skill.prerequisites) {
        const prereqSkill = MOCK_SKILLS.find((s) => s.id === prereqId);
        if (!prereqSkill) return false;
        const prereqLevel = getSkillLevel(prereqId);
        if (prereqLevel === 0) return false;
      }

      return true;
    },
    [getSkillLevel]
  );

  const addPoint = useCallback(
    (skillId: string) => {
      if (!canLearnSkill(skillId)) return;

      setState((prev) => ({
        ...prev,
        skillLevels: {
          ...prev.skillLevels,
          [skillId]: (prev.skillLevels[skillId] || 0) + 1,
        },
      }));
    },
    [canLearnSkill]
  );

  const removePoint = useCallback(
    (skillId: string) => {
      const currentLevel = getSkillLevel(skillId);
      if (currentLevel === 0) return;

      const dependentSkills = MOCK_SKILLS.filter(
        (skill) => skill.prerequisites.includes(skillId) && getSkillLevel(skill.id) > 0
      );

      if (currentLevel === 1 && dependentSkills.length > 0) return;

      setState((prev) => ({
        ...prev,
        skillLevels: {
          ...prev.skillLevels,
          [skillId]: Math.max(0, (prev.skillLevels[skillId] || 0) - 1),
        },
      }));
    },
    [getSkillLevel]
  );

  const resetTree = useCallback(() => {
    setState((prev) => ({
      ...prev,
      skillLevels: {},
    }));
  }, []);

  const setExpeditionPoints = useCallback((points: number) => {
    setState((prev) => ({
      ...prev,
      expeditionPoints: Math.max(0, points),
    }));
  }, []);

  const totalPointsUsed = useMemo(() => {
    return Object.values(state.skillLevels).reduce((sum, level) => sum + level, 0);
  }, [state.skillLevels]);

  const pointsByCategory = useMemo(() => {
    const result: Record<SkillCategory, number> = {
      conditioning: 0,
      mobility: 0,
      survival: 0,
    };

    for (const skill of MOCK_SKILLS) {
      const level = state.skillLevels[skill.id] || 0;
      result[skill.category] += level;
    }

    return result;
  }, [state.skillLevels]);

  const selectedSkills = useMemo(() => {
    return MOCK_SKILLS.filter((skill) => (state.skillLevels[skill.id] || 0) > 0);
  }, [state.skillLevels]);

  const totalLevel = useMemo(() => {
    return Math.min(15 + totalPointsUsed, MAX_TOTAL_POINTS);
  }, [totalPointsUsed]);

  return {
    skillLevels: state.skillLevels,
    expeditionPoints: state.expeditionPoints,
    getSkillLevel,
    canLearnSkill,
    addPoint,
    removePoint,
    resetTree,
    setExpeditionPoints,
    totalPointsUsed,
    pointsByCategory,
    selectedSkills,
    totalLevel,
  };
}
