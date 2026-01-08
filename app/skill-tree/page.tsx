"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { SkillTreeCanvas } from "@/components/skill-tree/SkillTreeCanvas";
import { SelectedSkillsSection } from "@/components/skill-tree/SelectedSkillsSection";
import { AllSkillsSection } from "@/components/skill-tree/AllSkillsSection";
import { InfoSection } from "@/components/skill-tree/InfoSection";
import { Button } from "@/components/ui/button";
import { useSkillTree } from "@/hooks/useSkillTree";
import { cn } from "@/lib/utils";

export default function SkillTreePage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const {
    skillLevels,
    expeditionPoints,
    availablePoints,
    totalPointsUsed,
    pointsByCategory,
    getSkillLevel,
    canLearnSkill,
    addPoint,
    removePoint,
    resetTree,
    setExpeditionPoints,
    selectedSkills,
    totalLevel,
  } = useSkillTree();

  return (
    <div className="w-full px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Skill Tree Builder</h1>
          <p className="text-sm text-muted-foreground">
            Arc Raiders {" > "} Skill Builder
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 transition-colors",
            isFavorite && "text-yellow-500"
          )}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          Add to Favourite
        </Button>
      </div>

      {/* Skill Tree Canvas */}
      <SkillTreeCanvas
        skillLevels={skillLevels}
        expeditionPoints={expeditionPoints}
        availablePoints={availablePoints}
        totalPointsUsed={totalPointsUsed}
        pointsByCategory={pointsByCategory}
        getSkillLevel={getSkillLevel}
        canLearnSkill={canLearnSkill}
        addPoint={addPoint}
        removePoint={removePoint}
        resetTree={resetTree}
        setExpeditionPoints={setExpeditionPoints}
      />

      {/* Selected Skills Section */}
      <SelectedSkillsSection
        selectedSkills={selectedSkills}
        getSkillLevel={getSkillLevel}
        totalLevel={totalLevel}
      />

      {/* Info Section */}
      <InfoSection />

      {/* All Available Skills Section */}
      <AllSkillsSection />
    </div>
  );
}
