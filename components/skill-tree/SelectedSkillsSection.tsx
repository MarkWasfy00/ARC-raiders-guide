import { Skill, CATEGORY_COLORS, CATEGORY_LABELS, SkillCategory } from "@/lib/skillTreeData";

interface SelectedSkillsSectionProps {
  selectedSkills: Skill[];
  getSkillLevel: (skillId: string) => number;
  totalLevel: number;
  totalPointsLimit: number;
}

export function SelectedSkillsSection({
  selectedSkills,
  getSkillLevel,
  totalLevel,
  totalPointsLimit,
}: SelectedSkillsSectionProps) {
  const skillsByCategory = {
    conditioning: selectedSkills.filter((skill) => skill.category === "conditioning"),
    mobility: selectedSkills.filter((skill) => skill.category === "mobility"),
    survival: selectedSkills.filter((skill) => skill.category === "survival"),
  };

  return (
    <div className="space-y-4 bg-background/50 border border-white/10 rounded-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Your Selected Skills</h2>
        <span className="text-sm text-muted-foreground">
          Level: <span className="text-primary font-semibold">{totalLevel}</span> /{" "}
          {totalPointsLimit}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["conditioning", "mobility", "survival"] as SkillCategory[]).map((category) => {
          const skills = skillsByCategory[category];
          const colors = CATEGORY_COLORS[category];

          return (
            <div key={category} className="space-y-3">
              <h3
                className="text-sm font-bold uppercase tracking-[0.25em] pb-2 border-b flex items-center justify-between"
                style={{
                  color: colors.primary,
                  borderColor: `${colors.primary}40`,
                }}
              >
                {CATEGORY_LABELS[category]}
                <span className="text-[11px] text-muted-foreground tracking-normal font-normal">
                  {skills.length} picked
                </span>
              </h3>

              <div className="space-y-2">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No skills selected</p>
                ) : (
                  skills.map((skill) => {
                    const level = getSkillLevel(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className="bg-card/60 border border-white/10 rounded-xl p-3 space-y-1 shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
                      >
                        <div
                          className="text-sm font-semibold uppercase tracking-wide flex items-center justify-between"
                          style={{ color: colors.primary }}
                        >
                          {skill.name}
                          <span className="text-[11px] text-muted-foreground">
                            {level} / {skill.maxLevel}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {skill.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
