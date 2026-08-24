'use client';

import type { DirectorySubmissionCreate } from '@basirah/shared';
import { Building2, Check, Gavel, Stethoscope, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/button-link';
import {
  BUSINESSES,
  HEALTH_PROFESSIONALS,
  LAWYERS,
  type DirectoryProfessional,
} from '@/data/community-directory';
import { submitDirectoryListing } from '@/lib/queries';

type ListingType = DirectorySubmissionCreate['listing_type'];

const unique = (items: string[]) => [...new Set(items)].sort((a, b) => a.localeCompare(b));
const BUSINESS_CATEGORIES = unique(BUSINESSES.map((item) => item.category));

function professionalSuggestions(items: DirectoryProfessional[]) {
  return {
    roles: unique(items.map((item) => item.role)),
    specialties: unique(items.map((item) => item.specialty)),
  };
}

const HEALTH_SUGGESTIONS = professionalSuggestions(HEALTH_PROFESSIONALS);
const LAW_SUGGESTIONS = professionalSuggestions(LAWYERS);

const field =
  'mt-1.5 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-basirah-teal/45 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] aria-invalid:border-basirah-rust motion-reduce:transition-none';
const label = 'block text-base font-semibold text-basirah-teal';

function normaliseWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function TypeChoice({
  icon: Icon,
  label: choiceLabel,
  selected,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-[border-color,background-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transform-none motion-reduce:transition-none ${
        selected
          ? 'border-basirah-teal bg-basirah-teal text-white'
          : 'border-basirah-teal/20 bg-white text-basirah-teal hover:-translate-y-0.5 hover:border-basirah-teal/50'
      }`}
    >
      <Icon className="size-6" aria-hidden />
      <span className="text-sm font-semibold leading-tight sm:text-base">{choiceLabel}</span>
    </button>
  );
}

export function DirectorySubmissionForm({ onDone }: { onDone: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const baseId = useId();
  const [listingType, setListingType] = useState<ListingType>('business');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [organization, setOrganization] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [evidence, setEvidence] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const professional = listingType !== 'business';
  const suggestions = listingType === 'lawyer' ? LAW_SUGGESTIONS : HEALTH_SUGGESTIONS;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Add the business or professional name.');
      return;
    }
    if (listingType === 'business' && category.trim().length < 2) {
      setError('Add a business category.');
      return;
    }
    if (professional && (role.trim().length < 2 || specialty.trim().length < 2)) {
      setError('Add both the professional role and specialty or practice areas.');
      return;
    }
    if (evidence.trim().length < 10) {
      setError('Tell us how you know this listing belongs in the directory.');
      return;
    }

    const common = {
      name: name.trim(),
      address: address.trim() || undefined,
      website: normaliseWebsite(website),
      evidence: evidence.trim(),
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (listingType === 'business') {
        await submitDirectoryListing({
          ...common,
          listing_type: 'business',
          category: category.trim(),
        });
      } else {
        await submitDirectoryListing({
          ...common,
          listing_type: listingType,
          role: role.trim(),
          specialty: specialty.trim(),
          organization: organization.trim() || undefined,
          public_email: publicEmail.trim() || undefined,
        });
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit that listing.');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <section className="rounded-2xl border border-basirah-teal/20 bg-white p-6 text-center sm:p-9">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-basirah-teal text-white">
          <Check className="size-7" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-basirah-teal">
          Listing submitted
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-basirah-teal/75">
          Thank you. We will check the details and supporting information before anything is
          published in the directory.
        </p>
        <Button className="mt-6" onClick={onDone}>
          Back to resources
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-basirah-teal/20 bg-basirah-cream/55 p-5 sm:p-8">
      <button
        type="button"
        onClick={onDone}
        className="-ms-2 mb-3 inline-flex min-h-11 cursor-pointer items-center rounded-lg px-2 text-sm font-semibold text-basirah-teal/70 transition-colors duration-150 hover:bg-white hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
      >
        Back to resources
      </button>
      <h2
        ref={titleRef}
        tabIndex={-1}
        className="font-display text-3xl font-semibold tracking-tight text-basirah-teal outline-none"
      >
        Add a directory listing
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-basirah-teal/75">
        Suggest a business, health professional, or lawyer. Every submission is reviewed before it
        can appear publicly.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <fieldset>
          <legend className={label}>What are you adding?</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
            <TypeChoice
              icon={Building2}
              label="Business"
              selected={listingType === 'business'}
              onClick={() => setListingType('business')}
            />
            <TypeChoice
              icon={Stethoscope}
              label="Health professional"
              selected={listingType === 'health_professional'}
              onClick={() => setListingType('health_professional')}
            />
            <TypeChoice
              icon={Gavel}
              label="Lawyer"
              selected={listingType === 'lawyer'}
              onClick={() => setListingType('lawyer')}
            />
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${baseId}-name`} className={label}>
            {professional ? 'Professional or organization name' : 'Business name'}
          </label>
          <input
            id={`${baseId}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="organization"
            required
            minLength={2}
            maxLength={200}
            className={field}
          />
        </div>

        {listingType === 'business' ? (
          <div>
            <label htmlFor={`${baseId}-category`} className={label}>
              Business category
            </label>
            <input
              id={`${baseId}-category`}
              list={`${baseId}-business-categories`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Start typing or add another category"
              required
              minLength={2}
              maxLength={160}
              className={field}
            />
            <datalist id={`${baseId}-business-categories`}>
              {BUSINESS_CATEGORIES.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${baseId}-role`} className={label}>
                  Professional title or role
                </label>
                <input
                  id={`${baseId}-role`}
                  list={`${baseId}-roles`}
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder={listingType === 'lawyer' ? 'Lawyer' : 'Psychologist, counsellor…'}
                  required
                  minLength={2}
                  maxLength={160}
                  className={field}
                />
                <datalist id={`${baseId}-roles`}>
                  {suggestions.roles.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor={`${baseId}-organization`} className={label}>
                  Organization <span className="font-normal text-basirah-teal/60">(optional)</span>
                </label>
                <input
                  id={`${baseId}-organization`}
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  autoComplete="organization"
                  maxLength={200}
                  className={field}
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${baseId}-specialty`} className={label}>
                {listingType === 'lawyer' ? 'Practice areas' : 'Specialty or services'}
              </label>
              <input
                id={`${baseId}-specialty`}
                list={`${baseId}-specialties`}
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                placeholder={
                  listingType === 'lawyer'
                    ? 'Family, immigration, wills and estates…'
                    : 'Counselling, psychology, dental care…'
                }
                required
                minLength={2}
                maxLength={500}
                className={field}
              />
              <datalist id={`${baseId}-specialties`}>
                {suggestions.specialties.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          </>
        )}

        <div>
          <label htmlFor={`${baseId}-address`} className={label}>
            Address or service area{' '}
            <span className="font-normal text-basirah-teal/60">(optional)</span>
          </label>
          <input
            id={`${baseId}-address`}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            autoComplete="street-address"
            maxLength={300}
            placeholder="Edmonton, AB"
            className={field}
          />
        </div>

        <div className={`grid gap-4 ${professional ? 'sm:grid-cols-2' : ''}`}>
          <div>
            <label htmlFor={`${baseId}-website`} className={label}>
              Website <span className="font-normal text-basirah-teal/60">(optional)</span>
            </label>
            <input
              id={`${baseId}-website`}
              type="text"
              inputMode="url"
              autoComplete="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              maxLength={300}
              placeholder="example.ca"
              className={field}
            />
          </div>
          {professional ? (
            <div>
              <label htmlFor={`${baseId}-email`} className={label}>
                Public contact email{' '}
                <span className="font-normal text-basirah-teal/60">(optional)</span>
              </label>
              <input
                id={`${baseId}-email`}
                type="email"
                autoComplete="email"
                value={publicEmail}
                onChange={(event) => setPublicEmail(event.target.value)}
                maxLength={254}
                className={field}
              />
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${baseId}-evidence`} className={label}>
            How do you know it belongs in this directory?
          </label>
          <textarea
            id={`${baseId}-evidence`}
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
            rows={3}
            required
            minLength={10}
            maxLength={800}
            placeholder="Share a public source, certification or association listing, or tell us if this is your own listing."
            className={field}
          />
          <p className="mt-2 text-sm leading-relaxed text-basirah-teal/65">
            We check the evidence and never infer someone’s religion from their name.
          </p>
        </div>

        <div>
          <label htmlFor={`${baseId}-notes`} className={label}>
            Anything else <span className="font-normal text-basirah-teal/60">(optional)</span>
          </label>
          <textarea
            id={`${baseId}-notes`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            maxLength={1000}
            className={field}
          />
        </div>

        {error ? (
          <p role="alert" className="text-base font-semibold text-basirah-rust">
            {error}
          </p>
        ) : null}

        <p className="text-sm leading-relaxed text-basirah-teal/75">
          Submitting sends these details to Basirah for review. They will not be published
          automatically.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit listing'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
