'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Star, User, Bell, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import { useEventTimers, formatTimeRemaining } from '@/app/features/event-timers';
import { UserButton } from '@/app/features/auth';
import type { Session } from 'next-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  session?: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, hasResults } = useSearch();
  const { activeEvents } = useEventTimers();

  // Filter only currently active events (not upcoming)
  const currentlyActiveEvents = activeEvents?.filter(e => e.status === 'active') || [];

  // Deduplicate events by name + map (some events have multiple time slots)
  const uniqueActiveEvents = currentlyActiveEvents.reduce((acc, curr) => {
    const key = `${curr.event.name}-${curr.event.map}`;
    if (!acc.find(e => `${e.event.name}-${e.event.map}` === key)) {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof currentlyActiveEvents);

  const activeEventCount = uniqueActiveEvents.length;
  const nextEvent = uniqueActiveEvents[0];


  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
      <nav className="fixed top-0 left-0 right-0 h-14 bg-background-elevated border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left section */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">3RB</span>
              </div>
            </Link>

            {/* Browse Games dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors outline-none">
                تصفح الألعاب
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-3 cursor-pointer">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">3RB</span>
                    </div>
                    <span className="text-sm">3RB</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث في 3RB"
                className="search-input w-full"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Ctrl + K
              </span>

              {/* Search Results Dropdown */}
              {isOpen && query.length >= 3 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-card max-h-96 overflow-y-auto z-50 animate-fade-in">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : hasResults ? (
                    <div className="p-2 space-y-4">
                      {results.items.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">العناصر</h4>
                          {results.items.slice(0, 5).map(item => (
                            <Link
                              key={item.id}
                              href={`/items/${item.id}`}
                              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.icon && (
                                <img src={item.icon} alt="" className="w-8 h-8 rounded object-cover" />
                              )}
                              <span className="text-sm">{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {results.quests.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">المهام</h4>
                          {results.quests.slice(0, 5).map(quest => (
                            <Link
                              key={quest.id}
                              href={`/quests/${quest.id}`}
                              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="text-sm">{quest.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {results.guides.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">الأدلة</h4>
                          {results.guides.slice(0, 5).map(guide => (
                            <Link
                              key={guide.id}
                              href={`/guides/${guide.id}`}
                              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="text-sm">{guide.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      لا توجد نتائج لـ "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Active Events */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors outline-none">
                <Bell className="w-4 h-4" />
                <span className="hidden lg:inline">{activeEventCount} حدث نشط</span>
                {nextEvent && (
                  <span className="text-xs text-muted-foreground hidden lg:inline">
                    {nextEvent.status === 'active' ? 'ينتهي' : 'يبدأ'} في: {formatTimeRemaining(nextEvent.timeUntilChange)}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">الأحداث النشطة</span>
                  <Link href="/events" className="text-xs text-primary hover:underline">
                    عرض الكل
                  </Link>
                </div>
                <div className="p-2 space-y-1">
                  {activeEventCount > 0 ? (
                    uniqueActiveEvents.slice(0, 5).map((activeEvent, index) => (
                      <DropdownMenuItem key={`${activeEvent.event.name}-${index}`} asChild>
                        <Link
                          href="/events"
                          className="flex items-center gap-3 p-2 rounded cursor-pointer"
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            activeEvent.status === 'active' ? "bg-green-500" : "bg-yellow-500"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activeEvent.event.name}</p>
                            <p className="text-xs text-primary truncate">{activeEvent.event.map}</p>
                            <p className="text-xs text-muted-foreground">
                              {activeEvent.status === 'active' ? 'ينتهي' : 'يبدأ'} في {formatTimeRemaining(activeEvent.timeUntilChange)}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      لا توجد أحداث نشطة حاليًا
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorites */}
            <DropdownMenu>
              <DropdownMenuTrigger className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary-glow transition-colors outline-none">
                <Star className="w-4 h-4 text-primary-foreground" fill="currentColor" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
                  المفضلة
                </DropdownMenuLabel>
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <p>لا توجد مفضلة بعد</p>
                  <p className="text-xs mt-1">ضع نجمة على الصفحات لحفظها هنا</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors outline-none">
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{session.user.name || session.user.email}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full text-right cursor-pointer justify-end">
                      ملفي الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit" className="w-full text-right cursor-pointer justify-end">
                      تعديل الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/listings" className="w-full text-right cursor-pointer justify-end">
                      قوائمي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/trades" className="w-full text-right cursor-pointer justify-end">
                      صفقاتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chat" className="w-full text-right cursor-pointer justify-end">
                      الرسائل
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <UserButton user={session.user} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
  );
}
