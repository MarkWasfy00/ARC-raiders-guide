'use client';

import { useState, useCallback, useMemo } from 'react';
import { SkillNode, SkillTreeState } from '../types';
import { SKILLS, MAX_SKILL_POINTS, MAX_EXPEDITION_POINTS } from '../data/skills';

export function useSkillTree() {
  const [state, setState] = useState<SkillTreeState>({
    unlockedSkills: new Set<string>(),
    totalPoints: 0,
    expeditionPoints: 0,
    maxPoints: MAX_SKILL_POINTS,
    maxExpeditionPoints: MAX_EXPEDITION_POINTS,
  });

  const skillsMap = useMemo(() => {
    return new Map(SKILLS.map(skill => [skill.id, skill]));
  }, []);

  const canUnlockSkill = useCallback((skillId: string): boolean => {
    const skill = skillsMap.get(skillId);
    if (!skill) return false;

    // Already unlocked
    if (state.unlockedSkills.has(skillId)) return false;

    // Check if we have enough points
    if (state.totalPoints >= state.maxPoints) return false;

    // Check expedition points
    if (state.expeditionPoints + skill.expeditionPointCost > state.maxExpeditionPoints) {
      return false;
    }

    // Check prerequisites
    for (const prereqId of skill.prerequisites) {
      if (!state.unlockedSkills.has(prereqId)) {
        return false;
      }
    }

    return true;
  }, [state, skillsMap]);

  const unlockSkill = useCallback((skillId: string) => {
    if (!canUnlockSkill(skillId)) return;

    const skill = skillsMap.get(skillId);
    if (!skill) return;

    setState(prev => ({
      ...prev,
      unlockedSkills: new Set([...prev.unlockedSkills, skillId]),
      totalPoints: prev.totalPoints + skill.cost,
      expeditionPoints: prev.expeditionPoints + skill.expeditionPointCost,
    }));
  }, [canUnlockSkill, skillsMap]);

  const canLockSkill = useCallback((skillId: string): boolean => {
    if (!state.unlockedSkills.has(skillId)) return false;

    // Check if any unlocked skill depends on this one
    for (const unlockedId of state.unlockedSkills) {
      const unlockedSkill = skillsMap.get(unlockedId);
      if (unlockedSkill?.prerequisites.includes(skillId)) {
        return false;
      }
    }

    return true;
  }, [state.unlockedSkills, skillsMap]);

  const lockSkill = useCallback((skillId: string) => {
    if (!canLockSkill(skillId)) return;

    const skill = skillsMap.get(skillId);
    if (!skill) return;

    const newUnlocked = new Set(state.unlockedSkills);
    newUnlocked.delete(skillId);

    setState(prev => ({
      ...prev,
      unlockedSkills: newUnlocked,
      totalPoints: prev.totalPoints - skill.cost,
      expeditionPoints: prev.expeditionPoints - skill.expeditionPointCost,
    }));
  }, [canLockSkill, state.unlockedSkills, skillsMap]);

  const reset = useCallback(() => {
    setState({
      unlockedSkills: new Set<string>(),
      totalPoints: 0,
      expeditionPoints: 0,
      maxPoints: MAX_SKILL_POINTS,
      maxExpeditionPoints: MAX_EXPEDITION_POINTS,
    });
  }, []);

  const addExpeditionPoint = useCallback(() => {
    setState(prev => ({
      ...prev,
      maxExpeditionPoints: Math.min(prev.maxExpeditionPoints + 1, 20),
    }));
  }, []);

  const removeExpeditionPoint = useCallback(() => {
    setState(prev => {
      const newMaxExpedition = Math.max(prev.maxExpeditionPoints - 1, 0);

      // If reducing max expedition points below current used, we need to recalculate
      if (prev.expeditionPoints > newMaxExpedition) {
        return prev; // Can't reduce if we're using more than the new max
      }

      return {
        ...prev,
        maxExpeditionPoints: newMaxExpedition,
      };
    });
  }, []);

  const loadBuild = useCallback((unlockedSkillIds: string[], maxExpeditionPoints: number) => {
    const unlockedSkills = new Set(unlockedSkillIds);
    let totalPoints = 0;
    let expeditionPoints = 0;

    for (const skillId of unlockedSkillIds) {
      const skill = skillsMap.get(skillId);
      if (skill) {
        totalPoints += skill.cost;
        expeditionPoints += skill.expeditionPointCost;
      }
    }

    setState({
      unlockedSkills,
      totalPoints,
      expeditionPoints,
      maxPoints: MAX_SKILL_POINTS,
      maxExpeditionPoints,
    });
  }, [skillsMap]);

  return {
    state,
    skills: SKILLS,
    unlockSkill,
    lockSkill,
    canUnlockSkill,
    canLockSkill,
    reset,
    addExpeditionPoint,
    removeExpeditionPoint,
    loadBuild,
  };
}
