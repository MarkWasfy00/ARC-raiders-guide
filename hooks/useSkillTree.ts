import { useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_SKILLS, SkillCategory, MAX_TOTAL_POINTS, MAX_EXPEDITION_POINTS, SMALL_SKILLS_2_INPUTS_1_OUTPUT } from '@/data/skillTreeData';

const STORAGE_KEY = 'arc-raiders-skill-tree';

interface SkillTreeState {
  skillLevels: Record<string, number>;
  expeditionPoints: number;
}

// Encode state to URL-safe base64
const encodeState = (state: SkillTreeState): string => {
  try {
    const json = JSON.stringify(state);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Failed to encode state:', e);
    return '';
  }
};

// Decode state from URL-safe base64
const decodeState = (encoded: string): SkillTreeState | null => {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode state:', e);
    return null;
  }
};

const getInitialState = (): SkillTreeState => {
  // First, check URL parameters for shared build
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const buildParam = params.get('build');
    if (buildParam) {
      const decodedState = decodeState(buildParam);
      if (decodedState) {
        return decodedState;
      }
    }
  }

  // Fall back to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load skill tree state:', e);
  }
  return {
    skillLevels: {},
    expeditionPoints: 0,
  };
};

export function useSkillTree() {
  const [state, setState] = useState<SkillTreeState>(getInitialState);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save skill tree state:', e);
    }
  }, [state]);

  const getSkillLevel = useCallback((skillId: string) => {
    return state.skillLevels[skillId] || 0;
  }, [state.skillLevels]);

  const canLearnSkill = useCallback((skillId: string) => {
    const skill = MOCK_SKILLS.find(s => s.id === skillId);
    if (!skill) return false;

    const currentLevel = getSkillLevel(skillId);
    if (currentLevel >= skill.maxLevel) return false;

    // Check prerequisites
    if (skill.tier === 3 && skill.requiredPoints === 36) {
      const hasPath = skill.prerequisites.some(prereqId => getSkillLevel(prereqId) > 0);
      if (!hasPath) return false;
    } else if (SMALL_SKILLS_2_INPUTS_1_OUTPUT.includes(skill.id)) {
      const hasPath = skill.prerequisites.some(prereqId => getSkillLevel(prereqId) > 0);
      if (!hasPath) return false;
    } else {
      for (const prereqId of skill.prerequisites) {
        const prereqSkill = MOCK_SKILLS.find(s => s.id === prereqId);
        if (!prereqSkill) return false;
        const prereqLevel = getSkillLevel(prereqId);
        if (prereqLevel === 0) return false;
      }
    }

    if (skill.requiredPoints) {
      const categoryPoints = MOCK_SKILLS.reduce((sum, s) => {
        return s.category === skill.category ? sum + getSkillLevel(s.id) : sum;
      }, 0);
      if (categoryPoints < skill.requiredPoints) return false;
    }

    return true;
  }, [getSkillLevel]);

  const addPoint = useCallback((skillId: string) => {
    if (!canLearnSkill(skillId)) return;

    setState(prev => {
      const totalUsed = Object.values(prev.skillLevels).reduce((sum, level) => sum + level, 0);
      const availablePoints = MAX_TOTAL_POINTS + prev.expeditionPoints;
      if (totalUsed >= availablePoints) return prev;

      return {
        ...prev,
        skillLevels: {
          ...prev.skillLevels,
          [skillId]: (prev.skillLevels[skillId] || 0) + 1,
        },
      };
    });
  }, [canLearnSkill]);

  const removePoint = useCallback((skillId: string) => {
    const currentLevel = getSkillLevel(skillId);
    if (currentLevel === 0) return;

    // Check if any skill depends on this one
    const dependentSkills = MOCK_SKILLS.filter(s => 
      s.prerequisites.includes(skillId) && getSkillLevel(s.id) > 0
    );

    // Only allow removal if no dependent skills have points, or if we have more than 1 point
    if (currentLevel === 1 && dependentSkills.length > 0) return;

    setState(prev => ({
      ...prev,
      skillLevels: {
        ...prev.skillLevels,
        [skillId]: Math.max(0, (prev.skillLevels[skillId] || 0) - 1),
      },
    }));
  }, [getSkillLevel]);

  const resetTree = useCallback(() => {
    setState(prev => ({
      ...prev,
      skillLevels: {},
      expeditionPoints: 0,
    }));
  }, []);

  const setExpeditionPoints = useCallback((points: number) => {
    setState(prev => ({
      ...prev,
      expeditionPoints: Math.max(0, Math.min(MAX_EXPEDITION_POINTS, points)),
    }));
  }, []);

  const totalPointsUsed = useMemo(() => {
    return Object.values(state.skillLevels).reduce((sum, level) => sum + level, 0);
  }, [state.skillLevels]);
  const availablePoints = useMemo(() => {
    return MAX_TOTAL_POINTS + state.expeditionPoints;
  }, [state.expeditionPoints]);

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
    return MOCK_SKILLS.filter(skill => (state.skillLevels[skill.id] || 0) > 0);
  }, [state.skillLevels]);

  const totalLevel = useMemo(() => {
    // Player level corresponds to skill points used (max level 75)
    return totalPointsUsed;
  }, [totalPointsUsed]);

  const generateShareUrl = useCallback(() => {
    const encoded = encodeState(state);
    if (!encoded) return '';

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/skill-tree?build=${encoded}`;
  }, [state]);

  return {
    skillLevels: state.skillLevels,
    expeditionPoints: state.expeditionPoints,
    availablePoints,
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
    generateShareUrl,
  };
}
