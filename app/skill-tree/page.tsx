'use client';

import { useState } from 'react';
import { useSkillTree } from '@/app/features/skill-tree/hooks/useSkillTree';
import { SkillTreeCanvas } from '@/app/features/skill-tree/components/SkillTreeCanvas';
import { BRANCH_COLORS } from '@/app/features/skill-tree/data/skills';
import { Button } from '@/components/ui/button';
import { Share2, RotateCcw, Plus, Minus } from 'lucide-react';

export default function SkillTreePage() {
  const {
    state,
    skills,
    unlockSkill,
    lockSkill,
    canUnlockSkill,
    canLockSkill,
    reset,
    addExpeditionPoint,
    removeExpeditionPoint,
  } = useSkillTree();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSkillClick = (skillId: string) => {
    if (canUnlockSkill(skillId)) {
      unlockSkill(skillId);
    }
  };

  const handleSkillRightClick = (skillId: string) => {
    if (canLockSkill(skillId)) {
      lockSkill(skillId);
    }
  };

  const handleReset = () => {
    reset();
    setShowResetDialog(false);
  };

  const getUnlockedSkillsByBranch = (branch: 'conditioning' | 'mobility' | 'survival') => {
    return skills.filter(
      skill => skill.branch === branch && state.unlockedSkills.has(skill.id)
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 overflow-x-hidden">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="relative flex flex-col gap-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">بناء شجرة المهارات</h1>
                <p className="text-muted-foreground mt-2">
                  خطط وحسّن شخصية ARC Raiders الخاصة بك
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="border-border bg-background/50 overflow-hidden rounded-xl border">
          {/* Controls Header */}
          <div className="bg-[#10141d] px-4 py-4 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Expedition Points */}
              <div className="text-muted-foreground inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-wide sm:flex-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">نقاط الاستكشاف</span>
                  <span className="text-foreground inline-flex min-w-[3ch] justify-end text-2xl font-bold normal-case tabular-nums leading-none">
                    {state.expeditionPoints}
                  </span>
                </div>
                <div className="flex items-center gap-2 pr-2">
                  <button
                    onClick={removeExpeditionPoint}
                    disabled={state.maxExpeditionPoints <= 0}
                    className="border-border text-foreground/80 h-8 w-8 cursor-pointer rounded-full border bg-white/5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove expedition point"
                  >
                    <Minus className="h-4 w-4 mx-auto" />
                  </button>
                  <button
                    onClick={addExpeditionPoint}
                    className="border-brand/40 text-brand h-8 w-8 cursor-pointer rounded-full border transition hover:bg-black/50"
                    aria-label="Add expedition point"
                  >
                    <Plus className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-foreground/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-wide md:text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand h-4 w-4"
                  >
                    <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"></path>
                    <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"></path>
                    <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"></path>
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
                  </svg>
                  <span className="hidden sm:inline">اسحب للتنقل</span>
                  <span className="sm:hidden">اسحب للتحريك</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand h-4 w-4"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="7"></rect>
                    <path d="M12 6v4"></path>
                  </svg>
                  <span className="hidden sm:inline">عجلة التمرير للتكبير</span>
                  <span className="sm:hidden">اقرص للتكبير</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand h-4 w-4"
                  >
                    <path d="M14 4.1 12 6"></path>
                    <path d="m5.1 8-2.9-.8"></path>
                    <path d="m6 12-1.9 2"></path>
                    <path d="M7.2 2.2 8 5.1"></path>
                    <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path>
                  </svg>
                  <span className="hidden sm:inline">انقر لتعلم المهارة</span>
                  <span className="sm:hidden">انقر لإضافة مهارة</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand h-4 w-4 hidden sm:inline"
                  >
                    <path d="M14 4.1 12 6"></path>
                    <path d="m5.1 8-2.9-.8"></path>
                    <path d="m6 12-1.9 2"></path>
                    <path d="M7.2 2.2 8 5.1"></path>
                    <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path>
                  </svg>
                  <span className="hidden sm:inline">انقر بزر الماوس الأيمن لإزالة النقاط</span>
                  <span className="sm:hidden">اسحب للخارج لإزالة النقاط</span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative h-[50vh] w-full overflow-hidden bg-[#090d17] md:h-[80vh]">
            <div className="h-full w-full">
              {/* Progress Bar */}
              <div className="absolute inset-x-2 top-2 z-30 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:inset-x-4 md:top-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="text-foreground/80 flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider md:text-sm">
                    <div>
                      <span>النقاط المستخدمة</span>{' '}
                      <span className="text-brand">{state.totalPoints}</span>{' '}
                      <span className="text-foreground/40">/</span>{' '}
                      <span>{state.maxPoints}</span>
                    </div>
                    <div className="text-foreground/60 flex items-center gap-2 text-[10px] uppercase md:text-xs">
                      <span>نقاط الاستكشاف</span>{' '}
                      <span className="text-brand font-semibold">
                        {state.expeditionPoints} / {state.maxExpeditionPoints}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 md:gap-4">
                  <Button
                    onClick={() => setShowShareDialog(true)}
                    variant="outline"
                    size="default"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">مشاركة</span>
                  </Button>

                  <Button
                    onClick={() => setShowResetDialog(true)}
                    variant="destructive"
                    size="default"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">إعادة تعيين</span>
                  </Button>
                </div>
              </div>

              {/* Skill Tree Canvas */}
              <SkillTreeCanvas
                skills={skills}
                unlockedSkills={state.unlockedSkills}
                onSkillClick={handleSkillClick}
                onSkillRightClick={handleSkillRightClick}
                canUnlockSkill={canUnlockSkill}
                canLockSkill={canLockSkill}
              />
            </div>
          </div>
        </div>

        {/* Selected Skills */}
        <div className="border-border bg-background/50 mt-6 rounded-lg border p-3 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold md:text-2xl">المهارات المحددة</h2>
              <div className="text-sm font-bold md:text-base text-brand">
                المستوى: {state.totalPoints} / {state.maxPoints}
              </div>
            </div>

            {state.unlockedSkills.size === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                انقر على المهارات في الشجرة أعلاه لبدء بناء شخصيتك.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Conditioning Skills */}
                {getUnlockedSkillsByBranch('conditioning').length > 0 && (
                  <div>
                    <h3
                      className="mb-2 text-base font-semibold md:text-lg"
                      style={{ color: BRANCH_COLORS.conditioning }}
                    >
                      مهارات التكييف
                    </h3>
                    <ul className="space-y-2">
                      {getUnlockedSkillsByBranch('conditioning').map(skill => (
                        <li key={skill.id} className="text-sm">
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {skill.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mobility Skills */}
                {getUnlockedSkillsByBranch('mobility').length > 0 && (
                  <div>
                    <h3
                      className="mb-2 text-base font-semibold md:text-lg"
                      style={{ color: BRANCH_COLORS.mobility }}
                    >
                      مهارات الحركة
                    </h3>
                    <ul className="space-y-2">
                      {getUnlockedSkillsByBranch('mobility').map(skill => (
                        <li key={skill.id} className="text-sm">
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {skill.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Survival Skills */}
                {getUnlockedSkillsByBranch('survival').length > 0 && (
                  <div>
                    <h3
                      className="mb-2 text-base font-semibold md:text-lg"
                      style={{ color: BRANCH_COLORS.survival }}
                    >
                      مهارات البقاء
                    </h3>
                    <ul className="space-y-2">
                      {getUnlockedSkillsByBranch('survival').map(skill => (
                        <li key={skill.id} className="text-sm">
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {skill.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reset Dialog */}
        {showResetDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background border-border max-w-md rounded-lg border p-6">
              <h3 className="text-lg font-semibold">تأكيد إعادة التعيين</h3>
              <p className="text-muted-foreground mt-2">
                هل أنت متأكد أنك تريد إعادة تعيين شجرة المهارات الخاصة بك؟ سيتم فقدان جميع
                التقدم.
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button onClick={() => setShowResetDialog(false)} variant="outline">
                  إلغاء
                </Button>
                <Button onClick={handleReset} variant="destructive">
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Share Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background border-border max-w-md rounded-lg border p-6">
              <h3 className="text-lg font-semibold">مشاركة البناء</h3>
              <p className="text-muted-foreground mt-2">
                ميزة المشاركة قادمة قريباً! سيمكنك مشاركة بناء شجرة المهارات الخاصة بك مع
                الآخرين.
              </p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button onClick={() => setShowShareDialog(false)} variant="outline">
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
