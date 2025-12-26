import { KEY_SKILLS } from "@/lib/skillTreeData";

export function InfoSection() {
  return (
    <div className="space-y-6 bg-gradient-to-br from-white/5 via-white/3 to-white/5 rounded-2xl border border-white/10 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Arc Raiders
          </p>
          <h2 className="text-2xl font-bold text-foreground">Skill Tree Planner</h2>
          <p className="text-muted-foreground leading-relaxed">
            Plot your raid-ready build across Conditioning, Mobility, and Survival. Spend points,
            respect prerequisites, and watch the branches light up as you commit to a path.
          </p>
        </div>
        <div className="bg-background/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-muted-foreground max-w-xs">
          Each branch tracks its own points. Click to invest, right-click to refund, and zoom/drag to
          explore the lattice.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-background/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Key picks</div>
          <ul className="space-y-3">
            {KEY_SKILLS.map((skill) => (
              <li key={skill.name} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{skill.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-background/40 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tips</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Anchor around a branch you want to max, then splash into a second for utility.</li>
            <li>Lock icons show unmet prerequisites. Refund backwards if you want to reroute.</li>
            <li>Use expedition points to mirror your in-raid limits and keep builds realistic.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
