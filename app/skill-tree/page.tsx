"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { SkillTreeCanvas } from "@/app/features/skill-tree/components/SkillTreeCanvas";
import { SelectedSkillsSection } from "@/app/features/skill-tree/components/SelectedSkillsSection";
import { AllSkillsSection } from "@/app/features/skill-tree/components/AllSkillsSection";
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
    generateShareUrl,
  } = useSkillTree();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">شجرة المهارات</h1>
            <p className="text-muted-foreground">
              قم ببناء وتخصيص شجرة المهارات الخاصة بك
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
            إضافة للمفضلة
          </Button>
        </div>
      </div>

      {/* Skill Tree Canvas */}
      <div className="space-y-8">
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
          generateShareUrl={generateShareUrl}
        />

        {/* Selected Skills Section */}
        <SelectedSkillsSection
          selectedSkills={selectedSkills}
          getSkillLevel={getSkillLevel}
          totalLevel={totalLevel}
        />

        {/* All Available Skills Section */}
        <AllSkillsSection />
      </div>
    </div>
  );
}
