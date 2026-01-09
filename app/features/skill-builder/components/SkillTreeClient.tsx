'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import skillsData from '@/lib/data/skills.json';

interface Skill {
  id: string;
  name: string;
  description: string;
  position: [number, number];
  cost: number;
  maxLevel: number;
  icon: string;
  requires: string[];
}

interface Branch {
  id: string;
  name: string;
  color: string;
  description: string;
  skills: Skill[];
}

interface SkillTreeClientProps {
  onPointsChange: (points: number) => void;
  onSkillsChange: (skills: Map<string, number>) => void;
  expeditionPoints: number;
}

const SkillTreeClient = memo(function SkillTreeClient({
  onPointsChange,
  onSkillsChange,
  expeditionPoints,
}: SkillTreeClientProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Map<string, number>>(new Map());
  const [skillMarkers, setSkillMarkers] = useState<Map<string, L.CircleMarker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = L.DomUtil.get('skill-tree-map');
    if (container != null) {
      // @ts-ignore
      container._leaflet_id = null;
    }

    // Define bounds that encompass all skills
    // Skills range from X: 100-500, Y: 400-1200
    const bounds = L.latLngBounds([350, 50], [1250, 550]);
    const center = bounds.getCenter();

    const mapInstance = L.map('skill-tree-map', {
      crs: L.CRS.Simple,
      center: center,
      zoom: 0.8,
      minZoom: 0,
      maxZoom: 2.5,
      zoomControl: true,
      attributionControl: false,
      zoomSnap: 0.1,
      zoomDelta: 0.25,
      maxBounds: bounds.pad(0.3),
    });

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  // Draw connections between skills
  const drawConnections = useCallback((mapInstance: L.Map) => {
    const branches = skillsData.branches as Branch[];

    branches.forEach((branch) => {
      branch.skills.forEach((skill) => {
        skill.requires.forEach((requiredId) => {
          const requiredSkill = branch.skills.find(s => s.id === requiredId);
          if (requiredSkill) {
            const isSelected = selectedSkills.has(skill.id) && selectedSkills.has(requiredId);
            const color = isSelected ? branch.color : '#334155';
            const weight = isSelected ? 3 : 2;
            const opacity = isSelected ? 0.8 : 0.3;

            L.polyline(
              [
                [requiredSkill.position[1], requiredSkill.position[0]],
                [skill.position[1], skill.position[0]]
              ],
              {
                color: color,
                weight: weight,
                opacity: opacity,
                className: 'skill-connection',
              }
            ).addTo(mapInstance);
          }
        });
      });
    });
  }, [selectedSkills]);

  // Create skill nodes
  useEffect(() => {
    if (!map) return;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Draw connections first (so they appear behind nodes)
    drawConnections(map);

    const branches = skillsData.branches as Branch[];
    const markers = new Map<string, L.CircleMarker>();

    branches.forEach((branch) => {
      branch.skills.forEach((skill) => {
        const isSelected = selectedSkills.has(skill.id);
        const canLearn = canLearnSkill(skill, branch.skills);

        const marker = L.circleMarker([skill.position[1], skill.position[0]], {
          radius: 20,
          fillColor: isSelected ? branch.color : canLearn ? '#475569' : '#1e293b',
          color: branch.color,
          weight: isSelected ? 3 : canLearn ? 2 : 1,
          opacity: isSelected || canLearn ? 1 : 0.4,
          fillOpacity: isSelected ? 0.9 : canLearn ? 0.6 : 0.3,
        });

        // Create custom tooltip
        const tooltipContent = `
          <div class="skill-tooltip">
            <div class="font-bold text-lg mb-1" style="color: ${branch.color}">${skill.name}</div>
            <div class="text-sm text-gray-300 mb-2">${skill.description}</div>
            <div class="text-xs text-gray-400">
              <div>Cost: ${skill.cost} point${skill.cost > 1 ? 's' : ''}</div>
              ${skill.requires.length > 0 ? `<div class="mt-1">Requires: ${skill.requires.map(r => {
                const req = branch.skills.find(s => s.id === r);
                return req?.name || r;
              }).join(', ')}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -25],
          className: 'skill-tree-tooltip',
        });

        // Click handler
        marker.on('click', () => handleSkillClick(skill, branch));

        marker.addTo(map);
        markers.set(skill.id, marker);
      });
    });

    setSkillMarkers(markers);
  }, [map, selectedSkills, expeditionPoints, drawConnections]);

  // Check if skill can be learned
  const canLearnSkill = (skill: Skill, branchSkills: Skill[]): boolean => {
    // Already selected
    if (selectedSkills.has(skill.id)) return true;

    // Check if requirements are met
    if (skill.requires.length === 0) return true;

    return skill.requires.every(reqId => selectedSkills.has(reqId));
  };

  // Handle skill click
  const handleSkillClick = (skill: Skill, branch: Branch) => {
    const newSelected = new Map(selectedSkills);
    const currentPoints = Array.from(selectedSkills.values()).reduce((sum, level) => {
      const s = branch.skills.find(sk => selectedSkills.has(sk.id));
      return sum + (s?.cost || 0);
    }, 0);

    if (newSelected.has(skill.id)) {
      // Remove skill and all dependent skills
      removeSkillAndDependents(skill.id, newSelected);
    } else {
      // Check if can afford and requirements met
      if (canLearnSkill(skill, branch.skills)) {
        const totalCost = currentPoints + skill.cost;
        if (totalCost <= 76 && (expeditionPoints === 0 || totalCost <= expeditionPoints)) {
          newSelected.set(skill.id, 1);
        }
      }
    }

    setSelectedSkills(newSelected);
    onSkillsChange(newSelected);

    // Calculate total points spent
    const pointsSpent = Array.from(newSelected.entries()).reduce((sum, [id]) => {
      const allSkills = skillsData.branches.flatMap(b => b.skills);
      const skill = allSkills.find(s => s.id === id);
      return sum + (skill?.cost || 0);
    }, 0);
    onPointsChange(pointsSpent);
  };

  // Remove skill and all skills that depend on it
  const removeSkillAndDependents = (skillId: string, skillMap: Map<string, number>) => {
    skillMap.delete(skillId);

    // Find and remove all skills that require this skill
    const allSkills = skillsData.branches.flatMap(b => b.skills) as Skill[];
    allSkills.forEach(skill => {
      if (skill.requires.includes(skillId) && skillMap.has(skill.id)) {
        removeSkillAndDependents(skill.id, skillMap);
      }
    });
  };

  return (
    <div className="relative h-full w-full">
      <div
        id="skill-tree-map"
        className="h-full w-full bg-[#090d17] rounded-lg"
        style={{ cursor: 'grab' }}
      />
      <style jsx global>{`
        .skill-tree-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
        }

        .skill-tooltip {
          min-width: 200px;
          max-width: 300px;
        }

        .leaflet-tooltip-top:before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
        }

        #skill-tree-map:active {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  );
});

export default SkillTreeClient;
