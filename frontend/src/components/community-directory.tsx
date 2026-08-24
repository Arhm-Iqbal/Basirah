'use client';

import { useMemo, useState, type ReactNode } from 'react';

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

type Tab = 'businesses' | 'health' | 'lawyers';

const TABS: { id: Tab; label: string }[] = [
  { id: 'businesses', label: 'Businesses' },
  { id: 'health', label: 'Health' },
  { id: 'lawyers', label: 'Lawyers' },
];

function matches(haystack: Array<string | undefined>, query: string) {
  return haystack.some((value) => value?.toLowerCase().includes(query));
}

function WebsiteLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex min-h-11 items-center text-base font-semibold text-basirah-rust underline-offset-4 hover:underline"
    >
      {href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
    </a>
  );
}

function BusinessCard({ business }: { business: DirectoryBusiness }) {
  return (
    <li className="rounded-lg border border-basirah-teal/20 bg-white p-5">
      <p className="text-base font-semibold text-basirah-teal">{business.name}</p>
      <p className="mt-1 text-sm text-basirah-teal/70">{business.category}</p>
      {business.address ? (
        <p className="mt-3 text-sm leading-relaxed text-basirah-teal/75">{business.address}</p>
      ) : null}
      {business.website ? (
        <p>
          <WebsiteLink href={business.website} />
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-basirah-teal/60">{business.basis}</p>
    </li>
  );
}

function ProfessionalCard({ person }: { person: DirectoryProfessional }) {
  return (
    <li className="rounded-lg border border-basirah-teal/20 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-base font-semibold text-basirah-teal">{person.name}</p>
        <span className="rounded-full bg-basirah-cream px-3 py-1 text-xs font-semibold text-basirah-teal/80">
          {person.confidence}
        </span>
      </div>
      <p className="mt-1 text-sm text-basirah-teal/70">{person.role}</p>
      <p className="mt-3 text-sm leading-relaxed text-basirah-teal">{person.specialty}</p>
      {person.organization ? (
        <p className="mt-2 text-sm text-basirah-teal/75">{person.organization}</p>
      ) : null}
      {person.website ? (
        <p>
          <WebsiteLink href={person.website} />
        </p>
      ) : null}
      {person.email ? (
        <p>
          <a
            href={`mailto:${person.email}`}
            className="mt-2 inline-flex min-h-11 items-center text-base font-semibold text-basirah-rust underline-offset-4 hover:underline"
          >
            {person.email}
          </a>
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-basirah-teal/60">{person.basis}</p>
    </li>
  );
}

export function CommunityDirectory() {
  const [tab, setTab] = useState<Tab>('businesses');
  const [query, setQuery] = useState('');
  const normalised = query.trim().toLowerCase();

  const businesses = useMemo(
    () =>
      BUSINESSES.filter((item) =>
        normalised
          ? matches([item.name, item.category, item.address, item.basis], normalised)
          : true,
      ),
    [normalised],
  );

  const health = useMemo(
    () =>
      HEALTH_PROFESSIONALS.filter((item) =>
        normalised
          ? matches(
              [item.name, item.role, item.specialty, item.organization, item.basis],
              normalised,
            )
          : true,
      ),
    [normalised],
  );

  const lawyers = useMemo(
    () =>
      LAWYERS.filter((item) =>
        normalised
          ? matches(
              [item.name, item.role, item.specialty, item.organization, item.basis],
              normalised,
            )
          : true,
      ),
    [normalised],
  );

  let notice: string;
  let total: number;
  let list: ReactNode;
  switch (tab) {
    case 'businesses':
      notice = BUSINESS_NOTICE;
      total = businesses.length;
      list = businesses.map((business) => (
        <BusinessCard key={`${business.name}-${business.address ?? ''}`} business={business} />
      ));
      break;
    case 'health':
      notice = PROFESSIONAL_NOTICE;
      total = health.length;
      list = health.map((person) => <ProfessionalCard key={person.name} person={person} />);
      break;
    case 'lawyers':
      notice = PROFESSIONAL_NOTICE;
      total = lawyers.length;
      list = lawyers.map((person) => <ProfessionalCard key={person.name} person={person} />);
      break;
    default: {
      const _exhaustive: never = tab;
      throw new Error(`Unhandled directory tab: ${_exhaustive}`);
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Directory sections"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-basirah-teal/15 px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px min-h-11 cursor-pointer border-b-2 px-4 py-2.5 text-base font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none ${
              tab === id
                ? 'border-basirah-teal text-basirah-teal'
                : 'border-transparent text-basirah-teal/55 hover:text-basirah-teal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-semibold text-basirah-teal">Search this list</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, specialty, or neighbourhood"
          className="mt-1.5 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none placeholder:text-basirah-teal/45 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)]"
        />
      </label>

      <p className="mt-4 rounded-lg border border-basirah-teal/20 bg-white p-4 text-sm leading-relaxed text-basirah-teal/80">
        {notice}
      </p>
      <p className="mt-3 text-sm text-basirah-teal/70">
        {total} {total === 1 ? 'entry' : 'entries'}, compiled {DIRECTORY_COMPILED} from public
        sources.
      </p>

      {total === 0 ? (
        <p className="mt-5 text-base text-basirah-teal/75">No listings match that search.</p>
      ) : (
        <ul className="mt-5 space-y-3">{list}</ul>
      )}
    </div>
  );
}
