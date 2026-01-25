'use client';

import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface FullscreenButtonProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function FullscreenButton({ containerRef }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="absolute top-4 start-4 z-[1001] bg-background/80 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-border/50 hover:bg-background transition-colors"
      title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? (
        <Minimize2 className="w-5 h-5 text-foreground" />
      ) : (
        <Maximize2 className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
}
