'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExploreCategory } from '../types';

const categories: ExploreCategory[] = [
  {
    id: 'guides',
    title: 'الأدلة',
    href: '/guides',
    imageUrl: '/images/categories/guides.webp',
    highlights: [
      'مسارات مختصرة مع نصائح الاشتباك',
      'إعدادات جاهزة للفرد أو الفريق',
      'لمحات ميتا محدثة مع كل تحديث',
    ],
  },
  {
    id: 'items',
    title: 'العناصر',
    href: '/items',
    imageUrl: '/images/categories/items.webp',
    highlights: [
      'مدخلات التصنيع وقيم البيع',
      'مقارنات أفضل القطع لكل خانة',
      'فلاتر سريعة لتخطيط العتاد',
    ],
  },
  {
    id: 'arcs',
    title: 'الآركس',
    href: '/arcs',
    imageUrl: '/images/categories/arcs.webp',
    highlights: [
      'نقاط الضعف ومستويات التهديد',
      'جداول لوت حسب نوع الاشتباك',
      'تكتيكات للمناطق عالية الخطورة',
    ],
  },
  {
    id: 'quests',
    title: 'المهام',
    href: '/quests',
    imageUrl: '/images/categories/quests.webp',
    highlights: [
      'خطوات واضحة لكل هدف',
      'قائمة العناصر المطلوبة',
      'أسرع خطوط الإخلاء',
    ],
  },
  {
    id: 'traders',
    title: 'التجار',
    href: '/traders',
    imageUrl: '/images/categories/traders.webp',
    highlights: [
      'مسارات فتح السمعة',
      'هوامش الربح حسب المستوى',
      'تذكير بمخزون الأسبوع',
    ],
  },
  {
    id: 'skill-tree',
    title: 'شجرة المهارات',
    href: '/skill-tree',
    imageUrl: '/images/categories/skill-tree.webp',
    highlights: [
      'مسارات أساسية لكل أسلوب',
      'عقد تآزر تستحق الأولوية',
      'نصائح للتخطيط قبل إعادة التوزيع',
    ],
  },
  {
    id: 'loadouts',
    title: 'العتاد',
    href: '/loadouts',
    imageUrl: '/images/categories/loadouts.webp',
    highlights: [
      'تجهيزات متوازنة حسب الميزانية',
      'أفضل توليفات الأسلحة',
      'أولوية الخانات المساندة',
    ],
  },
  {
    id: 'loot-value',
    title: 'قيمة الغنائم',
    href: '/loot-value',
    imageUrl: '/images/categories/loot-value.webp',
    highlights: [
      'ترتيب القيمة لكل خانة',
      'عائد إعادة التدوير',
      'مقارنات البيع السريع',
    ],
  },
  {
    id: 'needed-items',
    title: 'العناصر المطلوبة',
    href: '/needed-items',
    imageUrl: '/images/categories/needed-items.webp',
    highlights: [
      'تعقب عناصر المهام',
      'قائمة مختصرة لما يجب الاحتفاظ به',
      'تجهيزات جاهزة للمهام',
    ],
  },
];

export function ExploreGrid() {
  const [, setActiveId] = useState(categories[0]?.id);

  return (
    <div className="space-y-6">
      <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl group">
        <Image
          src="/banner/banner.jpg"
          alt="Arc Raiders"
          fill
          className="object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative h-full flex flex-col justify-center px-8 md:px-12 text-right" dir="rtl">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 backdrop-blur-sm">
              <span className="text-xs md:text-sm font-semibold text-orange-400 uppercase tracking-wider">
                🎮 دليل ARC Raiders الشامل
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-l from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent drop-shadow-2xl">
              3RB
            </h1>

            <p className="text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed drop-shadow-lg">
              مركزك الشامل لعالم ARC Raiders - قاعدة بيانات، أدلة، خرائط، وأدوات احترافية
            </p>

            <div className="flex flex-wrap gap-3 pt-2 justify-end">
              <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-sm text-gray-200">📊 قاعدة البيانات</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-sm text-gray-200">🗺️ الخرائط</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-sm text-gray-200">💬 المجتمع</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="flex flex-wrap items-center gap-2" dir="rtl">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            onMouseEnter={() => setActiveId(category.id)}
            onFocus={() => setActiveId(category.id)}
            className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 text-xs font-semibold transition-all duration-300 hover:border-orange-500/60 hover:bg-orange-500/10 hover:shadow-[0_0_18px_rgba(249,115,22,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 text-right"
          >
            <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-muted/50">
              <Image
                src={category.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="32px"
              />
            </span>
            <span>{category.title}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
