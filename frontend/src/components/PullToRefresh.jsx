import React, { useState, useRef, useCallback, useEffect } from 'react';

const THRESHOLD = 80;
const MAX_PULL = 130;

const PullToRefresh = ({ children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsPWA(isStandalone);
  }, []);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!isPWA || refreshing) return;
    if (isAtTop()) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [isPWA, refreshing, isAtTop]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && isAtTop()) {
      // Rubber band effect — diminishing returns as you pull further
      const distance = Math.min(diff * 0.45, MAX_PULL);
      setPullDistance(distance);
    } else {
      pulling.current = false;
      setPullDistance(0);
    }
  }, [refreshing, isAtTop]);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      // Small delay for the animation to feel right
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance]);

  // Only render the pull indicator for PWA mode
  if (!isPWA) return <>{children}</>;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = pullDistance >= THRESHOLD ? 360 : progress * 270;
  const scale = 0.5 + progress * 0.5;
  const opacity = Math.min(progress * 1.5, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      {/* Pull indicator */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          transform: `translateY(${pullDistance - 50}px)`,
          transition: pulling.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--ptr-bg, rgba(0,0,0,0.85))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            opacity,
            transform: `scale(${scale})`,
            transition: pulling.current ? 'none' : 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: pulling.current ? 'none' : 'transform 0.3s ease',
              animation: refreshing ? 'ptr-spin 0.8s linear infinite' : 'none',
            }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </div>
      </div>

      {/* Page content — no transform to avoid breaking position:fixed on bottom bar */}
      <div
        style={{
          paddingTop: pullDistance > 0 ? `${pullDistance * 0.3}px` : undefined,
          transition: pulling.current ? 'none' : 'padding-top 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-color-scheme: dark) {
          :root { --ptr-bg: rgba(40, 40, 40, 0.95); }
        }
        @media (prefers-color-scheme: light) {
          :root { --ptr-bg: rgba(0, 0, 0, 0.85); }
        }
      `}</style>
    </div>
  );
};

export default PullToRefresh;
