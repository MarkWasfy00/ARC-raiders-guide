import { MOCK_SKILLS, CATEGORY_COLORS, CATEGORY_LABELS, SkillCategory } from "@/lib/skillTreeData";

export function AllSkillsSection() {
  const skillsByCategory = {
    conditioning: MOCK_SKILLS.filter((skill) => skill.category === "conditioning"),
    mobility: MOCK_SKILLS.filter((skill) => skill.category === "mobility"),
    survival: MOCK_SKILLS.filter((skill) => skill.category === "survival"),
  };

  return (
    <div className="space-y-4 bg-background/40 border border-white/10 rounded-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
      <h2 className="text-xl font-bold text-foreground">All Available Skills</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["conditioning", "mobility", "survival"] as SkillCategory[]).map((category) => {
          const skills = skillsByCategory[category];
          const colors = CATEGORY_COLORS[category];

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: `${colors.primary}30` }}>
                <h3
                  className="text-sm font-bold uppercase tracking-[0.25em]"
                  style={{
                    color: colors.primary,
                  }}
                >
                  {CATEGORY_LABELS[category]} Skills
                </h3>
                <span className="text-[11px] text-muted-foreground">{skills.length} nodes</span>
              </div>

              <div className="space-y-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-card/50 border border-white/10 rounded-xl p-3 space-y-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
                  >
                    <div
                      className="text-sm font-semibold uppercase tracking-wide"
                      style={{ color: colors.primary }}
                    >
                      {skill.name}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
