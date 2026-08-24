'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import type { NearbyMosque } from '@/lib/queries';

const MAX_RESULTS = 6;

function distance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}

// Searches what the map has already loaded rather than the whole directory: the map holds
// the mosques inside the chosen radius plus the ones on the profile, so a name outside that
// radius genuinely is not on screen and the empty state says so.
export function MosqueSearch({
  mosques,
  onSelect,
}: {
  mosques: NearbyMosque[];
  onSelect: (mosque: NearbyMosque) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? mosques
        .filter((mosque) =>
          [mosque.name, mosque.address, mosque.city].some((value) =>
            value?.toLowerCase().includes(needle),
          ),
        )
        .slice(0, MAX_RESULTS)
    : [];

  useEffect(() => {
    setActive(0);
  }, [needle]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const choose = (mosque: NearbyMosque) => {
    onSelect(mosque);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setQuery('');
      setOpen(false);
      return;
    }
    if (!matches.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => (current + 1) % matches.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (current - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(matches[active] ?? matches[0]);
    }
  };

  const showEmpty = open && needle.length > 0 && matches.length === 0;

  return (
    <div ref={rootRef} className="relative w-[min(17rem,60vw)]">
      <Search
        className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-basirah-teal/50"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && (matches.length > 0 || showEmpty)}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Find a mosque by name"
        placeholder="Find a mosque by name"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-md border border-basirah-teal/20 bg-white py-2 ps-8 pe-8 text-sm text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-basirah-teal/50 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute end-1 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-basirah-teal/60 transition-colors duration-150 hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}

      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-basirah-teal/20 bg-white shadow-lg"
        >
          {matches.map((mosque, index) => (
            <li key={mosque.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                onPointerEnter={() => setActive(index)}
                onClick={() => choose(mosque)}
                className={`block w-full cursor-pointer px-3 py-2 text-start transition-colors duration-150 motion-reduce:transition-none ${
                  index === active ? 'bg-basirah-cream' : 'bg-white'
                }`}
              >
                <span className="block truncate text-sm font-semibold text-basirah-teal">
                  {mosque.name}
                </span>
                <span className="block truncate text-xs text-basirah-teal/70">
                  {distance(mosque.distance_m)}
                  {mosque.address ? ` · ${mosque.address}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showEmpty ? (
        <p
          id={listId}
          className="absolute inset-x-0 top-full z-10 mt-1 rounded-md border border-basirah-teal/20 bg-white px-3 py-2 text-xs leading-relaxed text-basirah-teal/75 shadow-lg"
        >
          No mosque on the map matches that. Try a wider radius.
        </p>
      ) : null}
    </div>
  );
}
