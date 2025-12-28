'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { SkillNode } from '../types';
import { BRANCH_COLORS } from '../data/skills';

interface SkillTreeCanvasProps {
  skills: SkillNode[];
  unlockedSkills: Set<string>;
  onSkillClick: (skillId: string) => void;
  onSkillRightClick: (skillId: string) => void;
  canUnlockSkill: (skillId: string) => boolean;
  canLockSkill: (skillId: string) => boolean;
}

interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function SkillTreeCanvas({
  skills,
  unlockedSkills,
  onSkillClick,
  onSkillRightClick,
  canUnlockSkill,
  canLockSkill,
}: SkillTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<ViewState>({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const NODE_RADIUS = 30;
  const HOVER_RADIUS = 35;

  // Transform screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const worldX = (screenX - rect.left - centerX - view.offsetX) / view.scale;
    const worldY = (screenY - rect.top - centerY - view.offsetY) / view.scale;

    return { x: worldX, y: worldY };
  }, [view]);

  // Find skill at position
  const getSkillAtPosition = useCallback((worldX: number, worldY: number): SkillNode | null => {
    for (const skill of skills) {
      const dx = worldX - skill.position.x;
      const dy = worldY - skill.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= NODE_RADIUS) {
        return skill;
      }
    }
    return null;
  }, [skills]);

  // Draw the skill tree
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = '#090d17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context and apply transformations
    ctx.save();
    ctx.translate(centerX + view.offsetX, centerY + view.offsetY);
    ctx.scale(view.scale, view.scale);

    // Draw connections first
    skills.forEach(skill => {
      skill.prerequisites.forEach(prereqId => {
        const prereq = skills.find(s => s.id === prereqId);
        if (!prereq) return;

        const isPathUnlocked = unlockedSkills.has(skill.id) && unlockedSkills.has(prereqId);

        ctx.beginPath();
        ctx.moveTo(prereq.position.x, prereq.position.y);
        ctx.lineTo(skill.position.x, skill.position.y);
        ctx.strokeStyle = isPathUnlocked
          ? BRANCH_COLORS[skill.branch]
          : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isPathUnlocked ? 3 : 2;
        ctx.stroke();
      });
    });

    // Draw nodes
    skills.forEach(skill => {
      const isUnlocked = unlockedSkills.has(skill.id);
      const canUnlock = canUnlockSkill(skill.id);
      const canLock = canLockSkill(skill.id);
      const isHovered = hoveredSkill === skill.id;

      // Node shadow for hover effect
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(skill.position.x, skill.position.y, HOVER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = BRANCH_COLORS[skill.branch] + '40';
        ctx.fill();
      }

      // Node background
      ctx.beginPath();
      ctx.arc(skill.position.x, skill.position.y, NODE_RADIUS, 0, Math.PI * 2);

      if (isUnlocked) {
        ctx.fillStyle = BRANCH_COLORS[skill.branch];
      } else if (canUnlock) {
        ctx.fillStyle = '#1a1f2e';
      } else {
        ctx.fillStyle = '#0f1419';
      }
      ctx.fill();

      // Node border
      ctx.beginPath();
      ctx.arc(skill.position.x, skill.position.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = isUnlocked
        ? BRANCH_COLORS[skill.branch]
        : canUnlock
          ? BRANCH_COLORS[skill.branch] + '80'
          : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Expedition point indicator
      if (skill.expeditionPointCost > 0) {
        ctx.beginPath();
        ctx.arc(
          skill.position.x + NODE_RADIUS - 8,
          skill.position.y - NODE_RADIUS + 8,
          8,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#d98c1a';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          skill.expeditionPointCost.toString(),
          skill.position.x + NODE_RADIUS - 8,
          skill.position.y - NODE_RADIUS + 8
        );
      }

      // Skill tier number
      ctx.fillStyle = isUnlocked ? '#000000' : '#ffffff';
      ctx.font = 'bold 14px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(skill.tier.toString(), skill.position.x, skill.position.y);
    });

    ctx.restore();
  }, [skills, unlockedSkills, view, hoveredSkill, canUnlockSkill, canLockSkill]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const skill = getSkillAtPosition(x, y);

    if (skill) {
      // Clicking on a skill
      if (e.button === 0) {
        // Left click
        onSkillClick(skill.id);
      } else if (e.button === 2) {
        // Right click
        e.preventDefault();
        onSkillRightClick(skill.id);
      }
    } else {
      // Start dragging
      setIsDragging(true);
      setDragStart({ x: e.clientX - view.offsetX, y: e.clientY - view.offsetY });
    }
  }, [screenToWorld, getSkillAtPosition, onSkillClick, onSkillRightClick, view]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setView(prev => ({
        ...prev,
        offsetX: e.clientX - dragStart.x,
        offsetY: e.clientY - dragStart.y,
      }));
    } else {
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const skill = getSkillAtPosition(x, y);
      setHoveredSkill(skill?.id || null);
    }
  }, [isDragging, dragStart, screenToWorld, getSkillAtPosition]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const delta = -e.deltaY / 500;
    const newScale = Math.max(0.3, Math.min(2, view.scale + delta));

    setView(prev => ({
      ...prev,
      scale: newScale,
    }));
  }, [view.scale]);

  // Handle touch events for mobile
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const { x, y } = screenToWorld(touch.clientX, touch.clientY);
      const skill = getSkillAtPosition(x, y);

      if (!skill) {
        setDragStart({ x: touch.clientX - view.offsetX, y: touch.clientY - view.offsetY });
        setIsDragging(true);
      }
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setTouchDistance(distance);
      setIsDragging(false);
    }
  }, [screenToWorld, getSkillAtPosition, view]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setView(prev => ({
        ...prev,
        offsetX: touch.clientX - dragStart.x,
        offsetY: touch.clientY - dragStart.y,
      }));
    } else if (e.touches.length === 2 && touchDistance !== null) {
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const delta = (distance - touchDistance) / 100;
      const newScale = Math.max(0.3, Math.min(2, view.scale + delta));

      setView(prev => ({
        ...prev,
        scale: newScale,
      }));
      setTouchDistance(distance);
    }
  }, [isDragging, dragStart, touchDistance, view.scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      if (!isDragging && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const { x, y } = screenToWorld(touch.clientX, touch.clientY);
        const skill = getSkillAtPosition(x, y);

        if (skill) {
          onSkillClick(skill.id);
        }
      }

      setIsDragging(false);
      setTouchDistance(null);
    } else if (e.touches.length === 1) {
      setTouchDistance(null);
    }
  }, [isDragging, screenToWorld, getSkillAtPosition, onSkillClick]);

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
      className="w-full h-full"
    />
  );
}
