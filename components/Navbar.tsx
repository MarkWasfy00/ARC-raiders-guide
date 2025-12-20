'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Star, User, Bell, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import { MOCK_EVENTS } from '@/lib/api';

export function Navbar() {
  const [gamesOpen, setGamesOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, hasResults } = useSearch();

  const searchRef = useRef<HTMLDivElement>(null);
  const anyDropdownOpen = gamesOpen || eventsOpen || userOpen || favoritesOpen || isOpen;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const closeAll = () => {
    setGamesOpen(false);
    setEventsOpen(false);
    setUserOpen(false);
    setFavoritesOpen(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      {anyDropdownOpen && (
        <div
          className="overlay-backdrop"
          onClick={closeAll}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 h-14 bg-background-elevated border-b border-border z-50">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left section */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AR</span>
              </div>
            </Link>

            {/* Browse Games dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                onMouseEnter={() => setGamesOpen(true)}
                onMouseLeave={() => setGamesOpen(false)}
              >
                Browse Games
                <ChevronDown className={cn("w-4 h-4 transition-transform", gamesOpen && "rotate-180")} />
              </button>

              {gamesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-card animate-fade-in z-50"
                  onMouseEnter={() => setGamesOpen(true)}
                  onMouseLeave={() => setGamesOpen(false)}
                >
                  <div className="p-2">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                      onClick={closeAll}
                    >
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">AR</span>
                      </div>
                      <span className="text-sm">Arc Raiders</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search MetaForge"
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
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Items</h4>
                          {results.items.slice(0, 5).map(item => (
                            <Link
                              key={item.id}
                              href={`/items/${item.id}`}
                              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary transition-colors"
                              onClick={closeAll}
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
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Quests</h4>
                          {results.quests.slice(0, 5).map(quest => (
                            <Link
                              key={quest.id}
                              href={`/quests/${quest.id}`}
                              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary transition-colors"
                              onClick={closeAll}
                            >
                              <span className="text-sm">{quest.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {results.guides.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Guides</h4>
                          {results.guides.slice(0, 5).map(guide => (
                            <Link
                              key={guide.id}
                              href={`/guides/${guide.id}`}
                              className="flex items-center gap-3 px-2 py-2 rounded hover:bg-secondary transition-colors"
                              onClick={closeAll}
                            >
                              <span className="text-sm">{guide.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Active Events */}
            <div className="relative">
              <button
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                onMouseEnter={() => setEventsOpen(true)}
                onMouseLeave={() => setEventsOpen(false)}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden lg:inline">{MOCK_EVENTS.length} active events</span>
                <span className="text-xs text-muted-foreground hidden lg:inline">ends in: 0m 47s</span>
              </button>

              {eventsOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-72 bg-popover border border-border rounded-lg shadow-card animate-fade-in z-50"
                  onMouseEnter={() => setEventsOpen(true)}
                  onMouseLeave={() => setEventsOpen(false)}
                >
                  <div className="p-3 border-b border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Active Events</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {MOCK_EVENTS.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          event.status === 'active' ? "bg-green-500" : "bg-yellow-500"
                        )} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.name}</p>
                          <p className="text-xs text-primary">{event.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.status === 'active' ? 'Ends in 48h 0m' : 'Starts in 48h 0m'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favorites */}
            <button
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary-glow transition-colors"
              onMouseEnter={() => setFavoritesOpen(true)}
              onMouseLeave={() => setFavoritesOpen(false)}
            >
              <Star className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </button>

            {favoritesOpen && (
              <div
                className="absolute top-14 right-24 w-64 bg-popover border border-border rounded-lg shadow-card animate-fade-in z-50"
                onMouseEnter={() => setFavoritesOpen(true)}
                onMouseLeave={() => setFavoritesOpen(false)}
              >
                <div className="p-3 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Favorites</span>
                </div>
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <p>No favorites yet</p>
                  <p className="text-xs mt-1">Star pages to save them here</p>
                </div>
              </div>
            )}

            {/* Premium button */}
            <Link
              href="/premium"
              className="hidden md:flex items-center px-4 py-1.5 bg-gradient-orange rounded-full text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Premium
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                onMouseEnter={() => setUserOpen(true)}
                onMouseLeave={() => setUserOpen(false)}
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Login</span>
              </button>

              {userOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-card animate-fade-in z-50"
                  onMouseEnter={() => setUserOpen(true)}
                  onMouseLeave={() => setUserOpen(false)}
                >
                  <div className="p-2 space-y-1">
                    <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-secondary transition-colors">
                      My Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-secondary transition-colors">
                      Edit Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-secondary transition-colors">
                      My Listings
                    </button>
                    <hr className="border-border my-1" />
                    <button className="w-full text-left px-3 py-2 text-sm text-destructive rounded hover:bg-secondary transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
