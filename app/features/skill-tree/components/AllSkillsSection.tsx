import { MOCK_SKILLS, CATEGORY_COLORS, CATEGORY_LABELS, SkillCategory } from '@/data/skillTreeData';

export function AllSkillsSection() {
  const skillsByCategory = {
    conditioning: MOCK_SKILLS.filter(s => s.category === 'conditioning'),
    mobility: MOCK_SKILLS.filter(s => s.category === 'mobility'),
    survival: MOCK_SKILLS.filter(s => s.category === 'survival'),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-xl font-bold text-foreground">جميع المهارات المتاحة</h2>

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
                مهارات {CATEGORY_LABELS[category]}
              </h3>

              {/* Skills List */}
              <div className="space-y-3">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="bg-card/30 border border-border/20 rounded-lg p-3 space-y-1.5"
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
