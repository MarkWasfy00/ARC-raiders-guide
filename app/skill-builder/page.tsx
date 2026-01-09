'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Share2, RotateCcw, Plus, Minus, Hand, Mouse, MousePointerClick } from 'lucide-react';
import skillsData from '@/lib/data/skills.json';

const SkillTreeClient = dynamic(
  () => import('@/app/features/skill-builder/components/SkillTreeClient'),
  { ssr: false }
);

interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export default function SkillBuilderPage() {
  const [pointsSpent, setPointsSpent] = useState(0);
  const [expeditionPoints, setExpeditionPoints] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<Map<string, number>>(new Map());
  const [resetKey, setResetKey] = useState(0);

  const MAX_POINTS = 76;

  const handleReset = useCallback(() => {
    if (confirm('هل أنت متأكد من إعادة تعيين شجرة المهارات؟ سيتم فقدان كل التقدم.')) {
      setPointsSpent(0);
      setSelectedSkills(new Map());
      setResetKey(prev => prev + 1);
    }
  }, []);

  const handleShare = useCallback(() => {
    const skillIds = Array.from(selectedSkills.keys()).join(',');
    const url = `${window.location.origin}/skill-builder?skills=${encodeURIComponent(skillIds)}`;

    navigator.clipboard.writeText(url).then(() => {
      alert('تم نسخ الرابط إلى الحافظة!');
    }).catch(() => {
      prompt('انسخ هذا الرابط:', url);
    });
  }, [selectedSkills]);

  const adjustExpeditionPoints = (delta: number) => {
    setExpeditionPoints(prev => Math.max(0, Math.min(MAX_POINTS, prev + delta)));
  };

  const getSelectedSkillsList = () => {
    const allSkills = skillsData.branches.flatMap(b => b.skills) as Skill[];
    return Array.from(selectedSkills.keys())
      .map(id => allSkills.find(s => s.id === id))
      .filter(Boolean) as Skill[];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">منشئ شجرة المهارات</h1>
              <div className="mt-2 flex gap-2 text-sm text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors">
                  الرئيسية
                </a>
                <span>&gt;</span>
                <span>منشئ المهارات</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
            <div className="bg-[#10141d] px-4 py-4 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Expedition Points */}
                <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-wide sm:flex-nowrap text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">نقاط الرحلة</span>
                    <span className="inline-flex min-w-[3ch] justify-end text-2xl font-bold normal-case tabular-nums leading-none text-foreground">
                      {expeditionPoints}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pr-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => adjustExpeditionPoints(-1)}
                      disabled={expeditionPoints === 0}
                      aria-label="إزالة نقطة رحلة"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full border-primary/40 text-primary hover:bg-black/50"
                      onClick={() => adjustExpeditionPoints(1)}
                      aria-label="إضافة نقطة رحلة"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-wide text-foreground/80 md:text-sm">
                  <div className="flex items-center gap-2">
                    <Hand className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">اسحب للتنقل</span>
                    <span className="sm:hidden">اسحب للتحريك</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mouse className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">عجلة الماوس للتكبير</span>
                    <span className="sm:hidden">قرص للتكبير</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">انقر لتعلم المهارة</span>
                    <span className="sm:hidden">اضغط لإضافة مهارة</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Tree Map */}
            <div className="relative h-[50vh] w-full overflow-hidden bg-[#090d17] md:h-[80vh]">
              <div className="absolute inset-x-2 top-2 z-[1000] flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:inset-x-4 md:top-6">
                <div className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80 md:text-sm">
                  <div>
                    <span>النقاط المستخدمة</span>{' '}
                    <span className="text-primary">{pointsSpent}</span>{' '}
                    <span className="text-foreground/40">/</span>{' '}
                    <span>{MAX_POINTS}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase text-foreground/60 md:text-xs">
                    <span>نقاط الرحلة</span>{' '}
                    <span className="font-semibold text-primary">{expeditionPoints}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={selectedSkills.size === 0}
                  >
                    <Share2 className="h-4 w-4 sm:ml-2" />
                    <span className="hidden sm:inline">مشاركة</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReset}
                    disabled={selectedSkills.size === 0}
                  >
                    <RotateCcw className="h-4 w-4 sm:ml-2" />
                    <span className="hidden sm:inline">إعادة تعيين</span>
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute left-2 right-2 top-16 z-[1000] md:left-4 md:right-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(pointsSpent / MAX_POINTS) * 100}%` }}
                  />
                </div>
              </div>

              <SkillTreeClient
                key={resetKey}
                onPointsChange={setPointsSpent}
                onSkillsChange={setSelectedSkills}
                expeditionPoints={expeditionPoints}
              />
            </div>
          </div>

          {/* Selected Skills */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold md:text-2xl">المهارات المحددة</h2>
                <div className="text-sm font-bold text-primary md:text-base">
                  المستوى: {pointsSpent} / {MAX_POINTS}
                </div>
              </div>

              {selectedSkills.size === 0 ? (
                <p className="text-sm italic text-muted-foreground">
                  انقر على المهارات في الشجرة أعلاه لبدء بناء شخصيتك.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {getSelectedSkillsList().map((skill) => {
                    const branch = skillsData.branches.find(b =>
                      b.skills.some(s => s.id === skill.id)
                    );
                    return (
                      <div
                        key={skill.id}
                        className="rounded-lg border border-border bg-background/50 p-3 hover:bg-background/80 transition-colors"
                      >
                        <div
                          className="mb-1 font-bold"
                          style={{ color: branch?.color }}
                        >
                          {skill.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {skill.description}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          التكلفة: {skill.cost} نقطة
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="rounded-lg border border-border bg-card/50 p-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold md:text-3xl">شجرة مهارات ARC Raiders</h1>
              <div className="space-y-3 text-sm text-muted-foreground md:text-base">
                <p>
                  خطط وحسّن شخصية ARC Raiders الخاصة بك باستخدام منشئ شجرة المهارات التفاعلي.
                  اختر من بين ثلاثة فروع مهارات مميزة:{' '}
                  <strong>التكييف</strong> و <strong>الحركة</strong> و <strong>البقاء</strong>.
                </p>

                <div>
                  <h2 className="mb-2 text-lg font-semibold text-foreground md:text-xl">
                    المهارات الرئيسية للنظر فيها
                  </h2>
                  <ul className="mr-6 list-disc space-y-1">
                    <li>
                      <strong>قدرة الناجي</strong> - حاسمة لمواقف القتال الممتدة
                    </li>
                    <li>
                      <strong>دم التيتان</strong> - زيادة كبيرة في الصحة القصوى
                    </li>
                    <li>
                      <strong>الشبح</strong> - مثالي للعب التخفي
                    </li>
                    <li>
                      <strong>طبيب ميداني</strong> - ضروري للبقاء على قيد الحياة
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
