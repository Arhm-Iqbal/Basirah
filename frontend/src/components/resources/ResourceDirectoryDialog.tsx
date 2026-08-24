'use client';

import { ArrowLeft, Briefcase, ExternalLink, Gavel, MapPin, Store, Stethoscope, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  BUSINESSES,
  BUSINESS_NOTICE,
  DIRECTORY_COMPILED,
  HEALTH_PROFESSIONALS,
  LAWYERS,
  PROFESSIONAL_NOTICE,
  type DirectoryBusiness,
  type DirectoryProfessional,
} from '@/data/community-directory';

type View = 'root' | 'businesses' | 'professionals' | 'health' | 'lawyers';

const TITLES: Record<View, string> = {
  root: 'Community resources',
  businesses: 'Muslim-owned and halal businesses',
  professionals: 'Professionals',
  health: 'Health professionals',
  lawyers: 'Lawyers',
};

const PARENT: Partial<Record<View, View>> = {
  businesses: 'root',
  professionals: 'root',
  health: 'professionals',
  lawyers: 'professionals',
};

export function ResourceDirectoryDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>('root');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const go = (next: View) => {
    setView(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const parent = PARENT[view];

  return (
    <dialog
      ref={dialogRef}
      aria-label="Community resources"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="bg-cream text-ink relative m-0 h-[100dvh] max-h-[100dvh] w-full max-w-none overflow-hidden border-0 p-0 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-3rem)] sm:max-w-[900px] sm:rounded-2xl"
    >
      <div className="flex max-h-[100dvh] flex-col sm:max-h-[90vh]">
        <header className="border-ink/10 bg-cream flex items-center gap-3 border-b px-5 py-4 sm:px-8">
          {parent ? (
            <button
              type="button"
              onClick={() => go(parent)}
              className="text-ink/70 hover:bg-mist hover:text-ink -ml-2 flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </button>
          ) : null}

          <h2 className="text-ink min-w-0 flex-1 truncate text-base font-semibold sm:text-lg">
            {TITLES[view]}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close resources"
            className="text-ink/70 hover:bg-mist hover:text-ink shrink-0 rounded-lg p-2 transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          {view === 'root' ? (
            <Choices
              intro="What are you looking for?"
              options={[
                {
                  icon: Store,
                  label: 'Businesses',
                  description: 'Muslim-owned and halal businesses across Edmonton.',
                  onSelect: () => go('businesses'),
                },
                {
                  icon: Briefcase,
                  label: 'Professionals',
                  description: 'Health professionals and lawyers serving the community.',
                  onSelect: () => go('professionals'),
                },
              ]}
            />
          ) : null}

          {view === 'professionals' ? (
            <Choices
              intro="Which kind of professional?"
              options={[
                {
                  icon: Stethoscope,
                  label: 'Health Professionals',
                  description: 'Counsellors, psychologists, dentists, and other practitioners.',
                  onSelect: () => go('health'),
                },
                {
                  icon: Gavel,
                  label: 'Lawyers',
                  description: 'Practice areas from family and immigration to Islamic wills.',
                  onSelect: () => go('lawyers'),
                },
              ]}
            />
          ) : null}

          {view === 'businesses' ? (
            <BusinessList items={BUSINESSES} notice={BUSINESS_NOTICE} />
          ) : null}

          {view === 'health' ? (
            <ProfessionalList items={HEALTH_PROFESSIONALS} notice={PROFESSIONAL_NOTICE} />
          ) : null}

          {view === 'lawyers' ? (
            <ProfessionalList items={LAWYERS} notice={PROFESSIONAL_NOTICE} />
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

type ChoiceOption = {
  icon: typeof Store;
  label: string;
  description: string;
  onSelect: () => void;
};

function Choices({ intro, options }: { intro: string; options: ChoiceOption[] }) {
  return (
    <div>
      <p className="text-ink text-center text-xl font-semibold tracking-tight sm:text-2xl">
        {intro}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {options.map(({ icon: Icon, label, description, onSelect }) => (
          <button
            key={label}
            type="button"
            onClick={onSelect}
            className="border-ink/15 hover:border-ink/40 flex flex-col items-start rounded-2xl border-2 bg-white p-5 text-left transition-colors sm:p-6"
          >
            <Icon className="text-ink size-7" aria-hidden />
            <span className="text-ink mt-3 text-lg font-semibold">{label}</span>
            <span className="text-ink/70 mt-1.5 text-sm leading-relaxed">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-ink/15 bg-mist text-ink/80 rounded-2xl border p-4 text-sm leading-relaxed">
      {children}
    </p>
  );
}

function Count({ total }: { total: number }) {
  return (
    <p className="text-ink/70 mt-4 text-sm">
      {total} {total === 1 ? 'entry' : 'entries'}, compiled {DIRECTORY_COMPILED} from public
      sources.
    </p>
  );
}

function BusinessList({ items, notice }: { items: DirectoryBusiness[]; notice: string }) {
  return (
    <div>
      <Notice>{notice}</Notice>
      <Count total={items.length} />

      <ul className="mt-5 space-y-3">
        {items.map((business) => (
          <li key={business.name} className="rounded-2xl bg-white p-5">
            <p className="text-ink text-base font-semibold">{business.name}</p>
            <p className="text-ink/70 mt-1 text-sm">{business.category}</p>

            {business.address ? (
              <p className="text-ink/70 mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {business.address}
              </p>
            ) : null}

            {business.website ? <WebsiteLink href={business.website} /> : null}

            <p className="text-ink/70 mt-3 text-xs leading-relaxed">{business.basis}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfessionalList({
  items,
  notice,
}: {
  items: DirectoryProfessional[];
  notice: string;
}) {
  return (
    <div>
      <Notice>{notice}</Notice>
      <Count total={items.length} />

      <ul className="mt-5 space-y-3">
        {items.map((person) => (
          <li key={person.name} className="rounded-2xl bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-ink text-base font-semibold">{person.name}</p>
              <span className="bg-mist text-ink/80 rounded-full px-3 py-1 text-xs font-semibold">
                {person.confidence}
              </span>
            </div>

            <p className="text-ink/70 mt-1 text-sm">{person.role}</p>
            <p className="text-ink/80 mt-3 text-sm leading-relaxed">{person.specialty}</p>

            {person.organization ? (
              <p className="text-ink/70 mt-2 text-sm">{person.organization}</p>
            ) : null}

            {person.website ? <WebsiteLink href={person.website} /> : null}

            {person.email ? (
              <p className="mt-2">
                <a
                  href={`mailto:${person.email}`}
                  className="text-rust text-sm font-semibold hover:underline"
                >
                  {person.email}
                </a>
              </p>
            ) : null}

            <p className="text-ink/70 mt-3 text-xs leading-relaxed">{person.basis}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WebsiteLink({ href }: { href: string }) {
  return (
    <p className="mt-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-rust inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
      >
        {href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </p>
  );
}
