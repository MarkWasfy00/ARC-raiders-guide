"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="w-full px-[100px] py-8 space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Arc Raiders
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">Skill Tree</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Skill Tree Builder</h1>
          <p className="text-sm text-muted-foreground">Plan your build and optimize your raid stats.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2 transition-colors", isFavorite && "text-yellow-500")}
          onClick={() => setIsFavorite((prev) => !prev)}
        >
          <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          Add to Favorites
        </Button>
      </div>

      <SkillTreeCanvas
        skillLevels={skillLevels}
        expeditionPoints={expeditionPoints}
        totalPointsUsed={totalPointsUsed}
        pointsByCategory={pointsByCategory}
        getSkillLevel={getSkillLevel}
        canLearnSkill={canLearnSkill}
        addPoint={addPoint}
        removePoint={removePoint}
        resetTree={resetTree}
        setExpeditionPoints={setExpeditionPoints}
      />

      <SelectedSkillsSection
        selectedSkills={selectedSkills}
        getSkillLevel={getSkillLevel}
        totalLevel={totalLevel}
      />

      <InfoSection />

      <AllSkillsSection />
    </div>
  );
}
