'use client';

import Link from 'next/link';
import Image from 'next/image';

export function HeroBanner() {
  return (
    <Link
      href="/"
      className="group relative block overflow-hidden rounded-xl w-full border border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/30 hover:border-orange-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ aspectRatio: '150/30' }}
      aria-label="Arc Raiders - Welcome to the guide"
    >
      {/* Background Image */}
      <Image
        src="/banner/banner.jpg"
        alt="Arc Raiders Hero Banner"
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
        priority
      />

      {/* Dynamic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Animated Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/20 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glowing Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 backdrop-blur-sm mb-2 w-fit">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              🎮 Live Guide
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-l from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent drop-shadow-2xl transition-transform duration-300 group-hover:translate-x-2">
            Arc Raiders
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-200 drop-shadow-lg max-w-md">
            دليلك الشامل للبقاء والاستراتيجية في عالم <span className="text-orange-400 font-bold">ARC Raiders</span>
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-2 pt-2 opacity-90 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs text-gray-200">🗺️ خرائط</span>
            </div>
            <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs text-gray-200">⚔️ استراتيجيات</span>
            </div>
            <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs text-gray-200">📊 بيانات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
}
