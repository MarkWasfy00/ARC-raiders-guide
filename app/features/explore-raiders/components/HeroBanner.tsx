'use client';

import Link from 'next/link';
import Image from 'next/image';

export function HeroBanner() {
  return (
    <Link
      href="/"
      className="group relative block overflow-hidden rounded-lg w-full border border-border transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ aspectRatio: '150/30' }}
      aria-label="Arc Raiders - Welcome to the guide"
    >
      {/* Background Image */}
      <Image
        src="/images/hero-banner.jpg"
        alt="Arc Raiders Hero Banner"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-3 md:p-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 transition-transform duration-300 group-hover:translate-x-2">
          Arc Raiders
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-white/90">
          Your complete guide to survival and strategy
        </p>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-colors duration-300" />
    </Link>
  );
}
