'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export const RADIUS_PRESETS = [
  { m: 5_000, label: '5 km' },
  { m: 15_000, label: '15 km' },
  { m: 50_000, label: '50 km' },
] as const;

export const MIN_RADIUS_M = 100;
export const MAX_RADIUS_M = 200_000;

export function formatKm(metres: number) {
  const km = metres / 1000;
  return Number.isInteger(km) ? String(km) : km.toFixed(1);
}

export function parseRadiusM(kmText: string): number | null {
  const km = Number.parseFloat(kmText.trim().replace(',', '.'));
  if (!Number.isFinite(km) || km <= 0) return null;
  return Math.round(Math.min(MAX_RADIUS_M, Math.max(MIN_RADIUS_M, km * 1000)));
}

export function useSearchRadius(initialM = 15_000) {
  const [radius, setRadius] = useState(initialM);
  const [customMode, setCustomMode] = useState(false);
  const [customKm, setCustomKm] = useState(() => formatKm(initialM));
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!customMode) return;
    const metres = parseRadiusM(customKm);
    if (metres == null || metres === radius) return;
    const id = window.setTimeout(() => setRadius(metres), 400);
    return () => window.clearTimeout(id);
  }, [customKm, customMode, radius]);

  const commitCustom = useCallback(() => {
    const metres = parseRadiusM(customKm);
    if (metres == null) {
      setCustomKm(formatKm(radius));
      return;
    }
    setRadius(metres);
    setCustomKm(formatKm(metres));
  }, [customKm, radius]);

  const choosePreset = useCallback((metres: number) => {
    setCustomMode(false);
    setRadius(metres);
  }, []);

  const chooseCustom = useCallback(() => {
    setCustomMode((wasCustom) => {
      if (!wasCustom) setCustomKm(formatKm(radius));
      return true;
    });
    requestAnimationFrame(() => customInputRef.current?.select());
  }, [radius]);

  return {
    radius,
    customMode,
    customKm,
    setCustomKm,
    customInputRef,
    commitCustom,
    choosePreset,
    chooseCustom,
  };
}

function chipClass(active: boolean) {
  return `min-h-9 cursor-pointer rounded-md px-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal ${
    active ? 'bg-basirah-teal text-white' : 'text-basirah-teal hover:bg-basirah-cream'
  }`;
}

export function RadiusChips({
  radius,
  customMode,
  customKm,
  customInputRef,
  onPreset,
  onChooseCustom,
  onCustomKmChange,
  onCustomCommit,
  className = 'flex flex-wrap items-center justify-end gap-1',
}: {
  radius: number;
  customMode: boolean;
  customKm: string;
  customInputRef: RefObject<HTMLInputElement | null>;
  onPreset: (metres: number) => void;
  onChooseCustom: () => void;
  onCustomKmChange: (value: string) => void;
  onCustomCommit: () => void;
  className?: string;
}) {
  return (
    <div className={className} role="group" aria-label="Search radius">
      {RADIUS_PRESETS.map((preset) => (
        <button
          key={preset.m}
          type="button"
          onClick={() => onPreset(preset.m)}
          aria-pressed={!customMode && radius === preset.m}
          className={chipClass(!customMode && radius === preset.m)}
        >
          {preset.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onChooseCustom}
        aria-pressed={customMode}
        className={chipClass(customMode)}
      >
        Custom
      </button>
      {customMode && (
        <label className="flex min-h-9 items-center gap-1 rounded-md border border-basirah-teal/30 bg-white ps-3 pe-3.5">
          <input
            ref={customInputRef}
            type="text"
            inputMode="decimal"
            value={customKm}
            onChange={(event) => onCustomKmChange(event.target.value)}
            onBlur={onCustomCommit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onCustomCommit();
                customInputRef.current?.blur();
              }
            }}
            aria-label="Custom range in kilometres, from 0.1 to 200"
            className="w-[3.25rem] bg-transparent text-center text-sm tabular-nums text-basirah-teal outline-none"
          />
          <span className="text-sm font-semibold text-basirah-teal">km</span>
        </label>
      )}
    </div>
  );
}
