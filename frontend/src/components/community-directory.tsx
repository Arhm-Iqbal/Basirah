'use client';

import { ArrowLeft, Gavel, Search, Stethoscope, X, type LucideIcon } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

import {
  BUSINESSES,
  DIRECTORY_COMPILED,
  HEALTH_PROFESSIONALS,
  LAWYERS,
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
  { label: 'Organizations', test: /organization/i },
];

function facetsFor(person: DirectoryProfessional, facets: Facet[]) {
  const haystack = `${person.role} ${person.specialty}`;
  return facets.filter((facet) => facet.test.test(haystack)).map((facet) => facet.label);
}

function matches(fields: Array<string | undefined>, query: string) {
  return fields.some((value) => value?.toLowerCase().includes(query));
}

function useSubtypeFilter<T>(items: T[], subType: string, typesOf: (item: T) => string[]) {
  return useMemo(() => {
    return items.filter((item) => subType === ALL || typesOf(item).includes(subType));
    // typesOf is defined inline at each call site and is stable in behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, subType]);
}

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; count: number }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="block sm:max-w-xs">
      <span className="text-sm font-semibold text-basirah-teal">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full cursor-pointer rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] motion-reduce:transition-none"
      >
        {options.map((option) => (
          <option key={option.label} value={option.label}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-semibold text-basirah-teal">
        Search all resources
      </label>
      <div className="relative mt-1.5">
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-basirah-teal/45"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Name, service, specialty, or neighbourhood"
          className="w-full rounded-full border border-basirah-teal/30 bg-white py-3 ps-11 pe-11 text-base text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-basirah-teal/45 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear resource search"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-basirah-teal/55 transition-colors duration-150 hover:bg-basirah-cream hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-basirah-teal/60">
        Search businesses, health professionals, and lawyers at once.
      </p>
    </div>
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
  icon: LucideIcon;
  label: string;
  description: string;
  count: number;
  onSelect: () => void;
};

type SimpleChoice = Pick<Choice, 'label' | 'onSelect'>;

function SimpleChoices({ intro, options }: { intro: string; options: SimpleChoice[] }) {
  return (
    <div className="pb-6 sm:pb-10">
      <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-basirah-teal sm:text-[1.75rem]">
        {intro}
      </h2>
      <div className="mx-auto mt-8 grid max-w-2xl gap-5 sm:grid-cols-2 sm:gap-6">
        {options.map(({ label, onSelect }) => (
          <button
            key={label}
            type="button"
            onClick={onSelect}
            className="group min-h-28 cursor-pointer rounded-[2rem] border-2 border-basirah-teal/20 bg-white px-5 py-7 text-center text-basirah-teal shadow-[0_14px_30px_-22px_rgb(4_51_52_/_70%)] transition-[border-color,background-color,color,box-shadow,transform] duration-150 hover:-translate-y-1 hover:border-basirah-teal hover:bg-basirah-teal hover:text-white hover:shadow-[0_20px_36px_-20px_rgb(4_51_52_/_65%)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-basirah-teal motion-reduce:transform-none motion-reduce:transition-none sm:min-h-32 sm:px-6 sm:py-8"
          >
            {/* Size lives on the span, not the button: globals.css sets
                `button { font-size: inherit }` outside any @layer, and unlayered CSS beats
                Tailwind's layered utilities, so a text-* class on a button is inert. */}
            <span className="block font-display text-3xl font-semibold tracking-[-0.02em] break-words sm:text-4xl">
              {label}
            </span>
            <span
              aria-hidden
              className="mx-auto mt-3 block h-1 w-10 rounded-full bg-basirah-rust/70 transition-[background-color,width] duration-150 group-hover:w-16 group-hover:bg-white/80 motion-reduce:transition-none"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Choices({ intro, options }: { intro: string; options: Choice[] }) {
  return (
    <div>
      <h2 className="text-center font-display text-xl font-semibold tracking-tight text-basirah-teal sm:text-2xl">
        {intro}
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {options.map(({ icon: Icon, label, description, count, onSelect }) => (
          <button
            key={label}
            type="button"
            onClick={onSelect}
            className="flex cursor-pointer items-center gap-4 rounded-[2rem] border-2 border-basirah-teal/15 bg-white px-5 py-4 text-start transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-basirah-teal/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transform-none motion-reduce:transition-none sm:px-6 sm:py-5"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-basirah-cream">
              <Icon className="size-6 text-basirah-teal" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-basirah-teal">{label}</span>
              <span className="mt-1 block text-sm leading-relaxed text-basirah-teal/70">
                {description}
              </span>
              <span className="mt-1.5 block text-xs font-semibold text-basirah-rust">
                {count} {count === 1 ? 'listing' : 'listings'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Results({ total, children }: { total: number; children: React.ReactNode }) {
  return (
    <>
      <p className="text-sm text-basirah-teal/70">
        {total} {total === 1 ? 'entry' : 'entries'}, compiled {DIRECTORY_COMPILED} from public
        sources.
      </p>
      {total === 0 ? (
        <p className="text-base text-basirah-teal/75">No listings in this type.</p>
      ) : (
        <ul className="space-y-3">{children}</ul>
      )}
    </>
  );
}

function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-basirah-teal">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-basirah-teal/70">{description}</p>
    </div>
  );
}

function SearchGroup({
  title,
  total,
  children,
}: {
  title: string;
  total: number;
  children: React.ReactNode;
}) {
  if (total === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <h3 className="font-display text-xl font-semibold text-basirah-teal">{title}</h3>
        <span className="rounded-full bg-basirah-cream px-2.5 py-1 text-xs font-semibold text-basirah-teal/70">
          {total}
        </span>
      </div>
      <ul className="mt-3 space-y-3">{children}</ul>
    </section>
  );
}

function SearchResults({
  query,
  businesses,
  health,
  lawyers,
}: {
  query: string;
  businesses: DirectoryBusiness[];
  health: DirectoryProfessional[];
  lawyers: DirectoryProfessional[];
}) {
  const total = businesses.length + health.length + lawyers.length;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-basirah-teal">
          Search results
        </h2>
        <p aria-live="polite" className="text-sm font-semibold text-basirah-teal/65">
          {total} {total === 1 ? 'match' : 'matches'}
        </p>
      </div>
      <p className="mt-1 text-sm text-basirah-teal/70">
        Across the full directory for “{query.trim()}”
      </p>

      {total === 0 ? (
        <div className="mt-6 rounded-2xl border border-basirah-teal/20 bg-white p-5">
          <p className="font-semibold text-basirah-teal">No resources match that search.</p>
          <p className="mt-1 text-sm leading-relaxed text-basirah-teal/70">
            Try a broader service, profession, business type, or neighbourhood.
          </p>
        </div>
      ) : (
        <>
          <SearchGroup title="Businesses" total={businesses.length}>
            {businesses.map((business) => (
              <BusinessCard
                key={`${business.name}-${business.address ?? ''}`}
                business={business}
              />
            ))}
          </SearchGroup>

          <SearchGroup title="Health professionals" total={health.length}>
            {health.map((person) => (
              <ProfessionalCard key={`health-${person.name}`} person={person} />
            ))}
          </SearchGroup>

          <SearchGroup title="Lawyers" total={lawyers.length}>
            {lawyers.map((person) => (
              <ProfessionalCard key={`lawyer-${person.name}`} person={person} />
            ))}
          </SearchGroup>
        </>
      )}
    </div>
  );
}

export function CommunityDirectory() {
  const [view, setView] = useState<View>('root');
  const [query, setQuery] = useState('');
  const [subType, setSubType] = useState(ALL);
  const normalisedQuery = query.trim().toLowerCase();

  const go = (next: View) => {
    setView(next);
    setQuery('');
    setSubType(ALL);
  };

  const businesses = useSubtypeFilter(BUSINESSES, subType, (item) => [businessType(item.category)]);
  const health = useSubtypeFilter(HEALTH_PROFESSIONALS, subType, (item) =>
    facetsFor(item, HEALTH_FACETS),
  );
  const lawyers = useSubtypeFilter(LAWYERS, subType, (item) => facetsFor(item, LAW_FACETS));

  const searchedBusinesses = useMemo(
    () =>
      normalisedQuery
        ? BUSINESSES.filter((item) =>
            matches(
              [
                item.name,
                item.category,
                item.address,
                item.website,
                item.basis,
                'business businesses',
              ],
              normalisedQuery,
            ),
          )
        : [],
    [normalisedQuery],
  );
  const searchedHealth = useMemo(
    () =>
      normalisedQuery
        ? HEALTH_PROFESSIONALS.filter((item) =>
            matches(
              [
                item.name,
                item.role,
                item.specialty,
                item.organization,
                item.website,
                item.email,
                item.basis,
                facetsFor(item, HEALTH_FACETS).join(' '),
                'health healthcare professional professionals',
              ],
              normalisedQuery,
            ),
          )
        : [],
    [normalisedQuery],
  );
  const searchedLawyers = useMemo(
    () =>
      normalisedQuery
        ? LAWYERS.filter((item) =>
            matches(
              [
                item.name,
                item.role,
                item.specialty,
                item.organization,
                item.website,
                item.email,
                item.basis,
                facetsFor(item, LAW_FACETS).join(' '),
                'lawyer lawyers legal professional professionals',
              ],
              normalisedQuery,
            ),
          )
        : [],
    [normalisedQuery],
  );

  // Counts come from the whole set rather than the current filter, so an option always says how
  // much sits behind it instead of collapsing to zero once another one is picked.
  const businessTypes = useMemo(() => {
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

  const professionalOptions = (items: DirectoryProfessional[], facets: Facet[]) => [
    { label: ALL, count: items.length },
    ...facets
      .map((facet) => ({
        label: facet.label,
        count: items.filter((item) => facetsFor(item, facets).includes(facet.label)).length,
      }))
      .filter((option) => option.count > 0),
  ];

  const healthDisciplines = useMemo(
    () => professionalOptions(HEALTH_PROFESSIONALS, HEALTH_FACETS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const lawyerAreas = useMemo(
    () => professionalOptions(LAWYERS, LAW_FACETS),
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
          className="-ms-2 mb-3 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-basirah-teal/70 transition-colors duration-150 hover:bg-basirah-cream hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </button>
      ) : null}

      <SearchBox value={query} onChange={setQuery} />

      {normalisedQuery ? (
        <SearchResults
          query={query}
          businesses={searchedBusinesses}
          health={searchedHealth}
          lawyers={searchedLawyers}
        />
      ) : (
        <div className="mt-6">
          {view === 'root' ? (
            <SimpleChoices
              intro="What are you looking for?"
              options={[
                {
                  label: 'Businesses',
                  onSelect: () => go('businesses'),
                },
                {
                  label: 'Professionals',
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
                  count: HEALTH_PROFESSIONALS.length,
                  onSelect: () => go('health'),
                },
                {
                  icon: Gavel,
                  label: 'Lawyers',
                  description: 'Practice areas from family and immigration to Islamic wills.',
                  count: LAWYERS.length,
                  onSelect: () => go('lawyers'),
                },
              ]}
            />
          ) : null}

          {view === 'businesses' ? (
            <div className="space-y-4">
              <SectionIntro
                title="Businesses"
                description="Pick a business type, or browse every listing."
              />
              <FilterSelect
                label="Business type"
                options={businessTypes}
                value={subType}
                onChange={setSubType}
              />
              <Results total={businesses.length}>
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
              <SectionIntro
                title="Health professionals"
                description="Pick a discipline, or browse every health listing."
              />
              <FilterSelect
                label="Discipline"
                options={healthDisciplines}
                value={subType}
                onChange={setSubType}
              />
              <Results total={health.length}>
                {health.map((person) => (
                  <ProfessionalCard key={person.name} person={person} />
                ))}
              </Results>
            </div>
          ) : null}

          {view === 'lawyers' ? (
            <div className="space-y-4">
              <SectionIntro
                title="Lawyers"
                description="Pick a practice area, or browse every legal listing."
              />
              <FilterSelect
                label="Practice area"
                options={lawyerAreas}
                value={subType}
                onChange={setSubType}
              />
              <Results total={lawyers.length}>
                {lawyers.map((person) => (
                  <ProfessionalCard key={person.name} person={person} />
                ))}
              </Results>
            </div>
          ) : null}
        </div>
      )}

      {/* Sits outside the view switch so it is reachable from the chooser and from every
          list, rather than only wherever someone happens to have drilled to. */}
      <p className="mt-10 border-t border-basirah-teal/15 pt-5 text-sm leading-relaxed text-pretty text-basirah-teal/70">
        To request an update to the website, or to add a new business or professional, please{' '}
        <a
          href="mailto:contact@basirah.ca"
          className="font-semibold text-basirah-rust underline-offset-4 hover:underline"
        >
          contact us
        </a>
        .
      </p>
    </div>
  );
}
