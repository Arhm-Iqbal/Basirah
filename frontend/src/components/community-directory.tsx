'use client';

import { ArrowLeft, Briefcase, Gavel, Stethoscope, Store } from 'lucide-react';
import { useMemo, useState } from 'react';

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

const PARENT: Partial<Record<View, View>> = {
  businesses: 'root',
  professionals: 'root',
  health: 'professionals',
  lawyers: 'professionals',
};

const ALL = 'All';

// Business categories are written "Type - Subtype" or "Type / Subtype", so the text before
// the first separator is the thing someone actually browses by.
function businessType(category: string) {
  return category.split(/\s+[-/]\s+/)[0].trim();
}

// Health roles and legal practice areas are free text rather than a fixed vocabulary, so
// the facets are matched by keyword. An entry can carry several -- most lawyers here list
// four or five practice areas -- and a facet is only offered when something matches it.
type Facet = { label: string; test: RegExp };

const HEALTH_FACETS: Facet[] = [
  { label: 'Psychology', test: /psycholog/i },
  { label: 'Counselling', test: /counsell|therapist|psychotherap/i },
  { label: 'Social work', test: /social worker/i },
  { label: 'Medical & dental', test: /dentist|dental|physician|surgeon|optometrist/i },
  { label: 'Nutrition', test: /dietitian|nutrition/i },
  { label: 'Hijama', test: /hijama|cupping/i },
  { label: 'Organizations', test: /organization/i },
];

const LAW_FACETS: Facet[] = [
  { label: 'Wills & estates', test: /will|estate/i },
  { label: 'Family', test: /family|matrimonial|divorce|nikah/i },
  { label: 'Immigration', test: /immigration|refugee/i },
  { label: 'Personal injury', test: /personal injury/i },
  { label: 'Real estate', test: /real estate/i },
  { label: 'Civil litigation', test: /litigation/i },
  { label: 'Corporate & commercial', test: /corporate|commercial|business law|banking/i },
  { label: 'Criminal', test: /criminal/i },
  { label: 'Employment & rights', test: /employment|human rights|labour/i },
  { label: 'Administrative', test: /administrative|regulatory|public law|aboriginal/i },
];

function facetsFor(person: DirectoryProfessional, facets: Facet[]) {
  const haystack = `${person.role} ${person.specialty}`;
  return facets.filter((facet) => facet.test.test(haystack)).map((facet) => facet.label);
}

function matches(fields: Array<string | undefined>, query: string) {
  return fields.some((value) => value?.toLowerCase().includes(query));
}

function useFiltered<T>(
  items: T[],
  query: string,
  subType: string,
  searchFields: (item: T) => Array<string | undefined>,
  typesOf: (item: T) => string[],
) {
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (subType === ALL || typesOf(item).includes(subType)) &&
        (!needle || matches(searchFields(item), needle)),
    );
    // searchFields/typesOf are defined inline at each call site and are stable in behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query, subType]);
}

function Chips({
  options,
  value,
  onChange,
  label,
}: {
  options: { label: string; count: number }[];
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {options.map((option) => {
          const active = option.label === value;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.label)}
              className={`min-h-11 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none ${
                active
                  ? 'border-basirah-teal bg-basirah-teal text-white'
                  : 'border-basirah-teal/25 bg-white text-basirah-teal hover:border-basirah-teal/50'
              }`}
            >
              {option.label}
              <span className={active ? 'ms-1.5 text-white/70' : 'ms-1.5 text-basirah-teal/55'}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-basirah-teal">Search this list</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-basirah-teal/45 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] motion-reduce:transition-none"
      />
    </label>
  );
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
      {business.website ? <WebsiteLink href={business.website} /> : null}
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
      {person.website ? <WebsiteLink href={person.website} /> : null}
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

type Choice = {
  icon: typeof Store;
  label: string;
  description: string;
  onSelect: () => void;
};

function Choices({ intro, options }: { intro: string; options: Choice[] }) {
  return (
    <div>
      <p className="text-center font-display text-xl font-semibold tracking-tight text-basirah-teal sm:text-2xl">
        {intro}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {options.map(({ icon: Icon, label, description, onSelect }) => (
          <button
            key={label}
            type="button"
            onClick={onSelect}
            className="flex cursor-pointer flex-col items-start rounded-2xl border-2 border-basirah-teal/15 bg-white p-5 text-start transition-colors duration-150 hover:border-basirah-teal/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none sm:p-6"
          >
            <Icon className="size-7 text-basirah-teal" aria-hidden />
            <span className="mt-3 text-lg font-semibold text-basirah-teal">{label}</span>
            <span className="mt-1.5 text-sm leading-relaxed text-basirah-teal/70">
              {description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Results({
  notice,
  total,
  children,
}: {
  notice: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <p className="mt-4 rounded-lg border border-basirah-teal/20 bg-white p-4 text-sm leading-relaxed text-basirah-teal/80">
        {notice}
      </p>
      <p className="mt-3 text-sm text-basirah-teal/70">
        {total} {total === 1 ? 'entry' : 'entries'}, compiled {DIRECTORY_COMPILED} from public
        sources.
      </p>
      {total === 0 ? (
        <p className="mt-5 text-base text-basirah-teal/75">
          Nothing matches that. Clear the search, or pick a different type.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">{children}</ul>
      )}
    </>
  );
}

export function CommunityDirectory() {
  const [view, setView] = useState<View>('root');
  const [query, setQuery] = useState('');
  const [subType, setSubType] = useState(ALL);

  const go = (next: View) => {
    setView(next);
    setQuery('');
    setSubType(ALL);
  };

  const businesses = useFiltered(
    BUSINESSES,
    query,
    subType,
    (item) => [item.name, item.category, item.address, item.basis],
    (item) => [businessType(item.category)],
  );
  const health = useFiltered(
    HEALTH_PROFESSIONALS,
    query,
    subType,
    (item) => [item.name, item.role, item.specialty, item.organization, item.basis],
    (item) => facetsFor(item, HEALTH_FACETS),
  );
  const lawyers = useFiltered(
    LAWYERS,
    query,
    subType,
    (item) => [item.name, item.role, item.specialty, item.organization, item.basis],
    (item) => facetsFor(item, LAW_FACETS),
  );

  // Counts come from the whole set rather than the current filter, so a chip always says how
  // much sits behind it instead of collapsing to zero once another chip is picked.
  const businessChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of BUSINESSES) {
      const type = businessType(item.category);
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return [
      { label: ALL, count: BUSINESSES.length },
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([label, count]) => ({ label, count })),
    ];
  }, []);

  const professionalChips = (items: DirectoryProfessional[], facets: Facet[]) => [
    { label: ALL, count: items.length },
    ...facets
      .map((facet) => ({
        label: facet.label,
        count: items.filter((item) => facetsFor(item, facets).includes(facet.label)).length,
      }))
      .filter((chip) => chip.count > 0),
  ];

  const healthChips = useMemo(
    () => professionalChips(HEALTH_PROFESSIONALS, HEALTH_FACETS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const lawyerChips = useMemo(
    () => professionalChips(LAWYERS, LAW_FACETS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const parent = PARENT[view];

  return (
    <div>
      {parent ? (
        <button
          type="button"
          onClick={() => go(parent)}
          className="-ms-2 mb-5 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-basirah-teal/70 transition-colors duration-150 hover:bg-basirah-cream hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </button>
      ) : null}

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
              label: 'Health professionals',
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
        <div className="space-y-4">
          <Chips
            options={businessChips}
            value={subType}
            onChange={setSubType}
            label="Filter businesses by type"
          />
          <SearchBox value={query} onChange={setQuery} placeholder="Name, or neighbourhood" />
          <Results notice={BUSINESS_NOTICE} total={businesses.length}>
            {businesses.map((business) => (
              <BusinessCard
                key={`${business.name}-${business.address ?? ''}`}
                business={business}
              />
            ))}
          </Results>
        </div>
      ) : null}

      {view === 'health' ? (
        <div className="space-y-4">
          <Chips
            options={healthChips}
            value={subType}
            onChange={setSubType}
            label="Filter health professionals by discipline"
          />
          <SearchBox value={query} onChange={setQuery} placeholder="Name, or specialty" />
          <Results notice={PROFESSIONAL_NOTICE} total={health.length}>
            {health.map((person) => (
              <ProfessionalCard key={person.name} person={person} />
            ))}
          </Results>
        </div>
      ) : null}

      {view === 'lawyers' ? (
        <div className="space-y-4">
          <Chips
            options={lawyerChips}
            value={subType}
            onChange={setSubType}
            label="Filter lawyers by practice area"
          />
          <SearchBox value={query} onChange={setQuery} placeholder="Name, or practice area" />
          <Results notice={PROFESSIONAL_NOTICE} total={lawyers.length}>
            {lawyers.map((person) => (
              <ProfessionalCard key={person.name} person={person} />
            ))}
          </Results>
        </div>
      ) : null}
    </div>
  );
}
