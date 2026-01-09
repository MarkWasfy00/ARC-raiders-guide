import { KEY_SKILLS, MAX_TOTAL_POINTS, MAX_EXPEDITION_POINTS, MAX_LEVEL } from '@/data/skillTreeData';

export function InfoSection() {
  return (
    <div className="space-y-6 bg-card/20 border border-border/30 rounded-lg p-6">
      {/* Main Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">ARC Raiders Skill Tree</h2>
        <p className="text-muted-foreground leading-relaxed">
          Plan and optimize your ARC Raiders character with our interactive skill tree builder.
          Choose from three distinct skill branches: Conditioning, Mobility, and Survival.
        </p>
        <div className="flex gap-4 pt-2 text-sm">
          <span className="text-muted-foreground">
            Max Level: <span className="text-primary font-semibold">{MAX_LEVEL}</span>
          </span>
          <span className="text-muted-foreground">
            Base Points: <span className="text-primary font-semibold">{MAX_TOTAL_POINTS}</span>
          </span>
          <span className="text-muted-foreground">
            Expedition Bonus: <span className="text-primary font-semibold">+{MAX_EXPEDITION_POINTS}</span>
          </span>
        </div>
      </div>

      {/* Key Skills */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Key Skills to Consider</h3>
        <ul className="space-y-2">
          {KEY_SKILLS.map(skill => (
            <li key={skill.name} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary">•</span>
              <span>
                <span className="font-medium text-foreground">{skill.name}</span>
                {' – '}
                {skill.description}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Closing Text */}
      <p className="text-sm text-muted-foreground italic border-t border-border/30 pt-4">
        Share your builds with the community. Experiment with different combinations to find the perfect build.
      </p>
    </div>
  );
}
