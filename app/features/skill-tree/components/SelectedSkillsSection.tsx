import { Skill, CATEGORY_COLORS, CATEGORY_LABELS, SkillCategory, MAX_TOTAL_POINTS, MAX_EXPEDITION_POINTS, MAX_LEVEL } from '@/data/skillTreeData';

interface SelectedSkillsSectionProps {
  selectedSkills: Skill[];
  getSkillLevel: (skillId: string) => number;
  totalLevel: number;
}

export function SelectedSkillsSection({
  selectedSkills,
  getSkillLevel,
  totalLevel,
}: SelectedSkillsSectionProps) {
  const skillsByCategory = {
    conditioning: selectedSkills.filter(s => s.category === 'conditioning'),
    mobility: selectedSkills.filter(s => s.category === 'mobility'),
    survival: selectedSkills.filter(s => s.category === 'survival'),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">المهارات المحددة</h2>
        <span className="text-sm text-muted-foreground">
          النقاط المستخدمة: <span className="text-primary font-semibold">{totalLevel}</span> / {MAX_TOTAL_POINTS + MAX_EXPEDITION_POINTS}
        </span>
      </div>

      {/* Three Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['survival', 'mobility', 'conditioning'] as SkillCategory[]).map(category => {
          const skills = skillsByCategory[category];
          const colors = CATEGORY_COLORS[category];

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <h3
                className="text-sm font-bold uppercase tracking-wider pb-2 border-b"
                style={{
                  color: colors.primary,
                  borderColor: `${colors.primary}40`,
                }}
              >
                {CATEGORY_LABELS[category]}
              </h3>

              {/* Skills List */}
              <div className="space-y-2">
                {skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">لا توجد مهارات محددة</p>
                ) : (
                  skills.map(skill => {
                    const level = getSkillLevel(skill.id);
                    return (
                      <div
                        key={skill.id}
                        className="bg-card/50 border border-border/30 rounded-lg p-3 space-y-1"
                      >
                        <div
                          className="text-sm font-semibold uppercase tracking-wide"
                          style={{ color: colors.primary }}
                        >
                          {skill.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          المستوى: {level} / {skill.maxLevel}
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
