'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export function Reveal({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('is-visible');
      return;
    }

    const isInView = () => {
      const box = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return box.top < viewportHeight * 0.9 && box.bottom > 32;
    };

    let intervalId = 0;

    const show = () => {
      node.classList.add('is-visible');
      window.clearInterval(intervalId);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.body.removeEventListener('scroll', onScroll);
    };

    const onScroll = () => {
      if (isInView()) show();
    };

    if (isInView()) {
      show();
      return;
    }

    intervalId = window.setInterval(onScroll, 100);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.body.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.body.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
