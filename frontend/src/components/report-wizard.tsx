'use client';

import { useState } from 'react';

import { Button } from '@/components/button-link';
import { createClient } from '@/lib/supabase/client';
import {
  EMPTY_REPORT,
  stepsForRoute,
  toApiPayload,
  validateStep,
  type IncidentReport,
  type IncidentRoute,
  type ReportErrors,
  type StepId,
} from '@/lib/report-flow';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Guidance = {
  urgency: 'routine' | 'elevated' | 'urgent';
  steps: { title: string; detail: string }[];
  note: string;
};

const field =
  'mt-1.5 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-basirah-teal/45 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] aria-invalid:border-basirah-rust aria-invalid:shadow-[0_0_0_3px_rgb(148_33_6_/_18%)] motion-reduce:transition-none';
const labelClass = 'block text-base font-semibold text-basirah-teal';
const hintClass = 'mt-1 text-sm leading-relaxed text-basirah-teal/75';

const REVIEW_ROWS: { key: keyof IncidentReport; label: string }[] = [
  { key: 'route', label: 'Where it happened' },
  { key: 'online_platform', label: 'Site or app' },
  { key: 'online_url', label: 'Link' },
  { key: 'online_account', label: 'Account or handle' },
  { key: 'location_kind', label: 'Kind of place' },
  { key: 'location_name', label: 'Place name' },
  { key: 'location_address', label: 'Address or intersection' },
  { key: 'target', label: 'Who or what was targeted' },
  { key: 'responsible_party', label: 'What they did' },
  { key: 'occurred_on', label: 'Date' },
  { key: 'occurred_at', label: 'Time' },
  { key: 'still_happening', label: 'Still happening' },
  { key: 'witnesses', label: 'Witnesses' },
  { key: 'threats', label: 'Threats' },
  { key: 'weapon', label: 'Weapon' },
  { key: 'description', label: 'What happened' },
  { key: 'other_details', label: 'Anything else' },
  { key: 'reporter_name', label: 'Your name' },
  { key: 'reporter_email', label: 'Email' },
  { key: 'reporter_phone', label: 'Phone' },
  { key: 'reporting_for', label: 'Reporting for' },
  { key: 'reported_elsewhere', label: 'Reported elsewhere' },
  { key: 'support_needed', label: 'Support that would help' },
];

function formatReviewValue(key: keyof IncidentReport, value: string) {
  if (key === 'route') return value === 'online' ? 'Online' : 'In person';
  return value;
}

function Text({
  id,
  labelText,
  hintText,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  id: string;
  labelText: string;
  hintText?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const hintId = hintText ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {labelText}
      </label>
      {hintText && (
        <p id={hintId} className={hintClass}>
          {hintText}
        </p>
      )}
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={field}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-basirah-rust">
          {error}
        </p>
      )}
    </div>
  );
}

function Long({
  id,
  labelText,
  hintText,
  value,
  onChange,
  error,
  rows = 4,
}: {
  id: string;
  labelText: string;
  hintText?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  rows?: number;
}) {
  const hintId = hintText ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {labelText}
      </label>
      {hintText && (
        <p id={hintId} className={hintClass}>
          {hintText}
        </p>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={field}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-basirah-rust">
          {error}
        </p>
      )}
    </div>
  );
}

export function ReportWizard() {
  const [report, setReport] = useState<IncidentReport>(EMPTY_REPORT);
  const [errors, setErrors] = useState<ReportErrors>({});
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [guidanceState, setGuidanceState] = useState<'idle' | 'loading' | 'failed'>('idle');

  const set = <K extends keyof IncidentReport>(key: K, value: IncidentReport[K]) => {
    setReport((r) => ({ ...r, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const steps = report.route ? stepsForRoute(report.route) : [];
  const step: StepId | undefined = steps[index]?.id;

  const next = () => {
    if (!step) return;
    const found = validateStep(step, report);
    const first = Object.keys(found)[0];
    if (first) {
      setErrors(found);
      requestAnimationFrame(() => document.getElementById(first)?.focus());
      return;
    }
    setIndex((i) => i + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await createClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('You are signed out. Sign in and try again.');

      const res = await fetch(`${API_URL}/v1/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(toApiPayload(report)),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (body as { error?: { message?: string } } | null)?.error?.message ??
            'Your report could not be submitted.',
        );
      }

      const id = (body as { id: string }).id;
      setCreatedId(id);
      void loadGuidance(id, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your report could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadGuidance = async (id: string, token: string) => {
    setGuidanceState('loading');
    try {
      const res = await fetch(`${API_URL}/v1/incidents/${id}/guidance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('no guidance');
      setGuidance((await res.json()) as Guidance);
      setGuidanceState('idle');
    } catch {
      setGuidanceState('failed');
    }
  };

  if (createdId) {
    return (
      <div>
        <h2 className="font-display text-xl font-semibold tracking-[-0.015em] text-basirah-teal">
          Report received
        </h2>
        <p className="mt-2 text-base leading-relaxed text-basirah-teal">
          It goes to your community&apos;s verification team first. Nothing is sent as a
          community-wide alert until a person has verified it.
        </p>
        <p className="mt-1 text-sm text-basirah-teal/70">Reference {createdId}</p>

        <div className="mt-6 border-t border-basirah-teal/15 pt-5">
          <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
            What you can do next
          </h3>

          {guidanceState === 'loading' && (
            <p className="mt-3 text-base text-basirah-teal/70">Looking up what you can do next…</p>
          )}
          {guidanceState === 'failed' && (
            <p className="mt-3 text-base text-basirah-teal/70">
              Next-step suggestions are unavailable right now. Your report is saved.
            </p>
          )}

          {guidance && (
            <>
              <ol className="mt-4 space-y-3">
                {guidance.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-basirah-teal text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-basirah-teal">{s.title}</p>
                      <p className="mt-0.5 text-base leading-relaxed text-basirah-teal/80">
                        {s.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-basirah-teal/75">{guidance.note}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div>
        <div className="rounded-lg border border-basirah-rust/30 bg-basirah-rust/8 p-4">
          <h2 className="text-base font-semibold text-basirah-rust">Are you in immediate danger?</h2>
          <p className="mt-1.5 text-base leading-relaxed text-basirah-teal">
            If you or someone else is in immediate danger, call 911. This form is for documentation
            and follow-up, not emergency response.
          </p>
        </div>

        <fieldset className="mt-6">
          <legend className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
            Where did this happen?
          </legend>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {(
              [
                {
                  value: 'in_person',
                  title: 'In person',
                  body: 'At a mosque, in public, at work, or at school.',
                },
                {
                  value: 'online',
                  title: 'Online',
                  body: 'Social media, messages, email, or a website.',
                },
              ] as { value: IncidentRoute; title: string; body: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set('route', option.value)}
                aria-pressed={report.route === option.value}
                className={`cursor-pointer rounded-lg border p-3.5 text-start transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal ${
                  report.route === option.value
                    ? 'border-basirah-teal bg-basirah-teal/8'
                    : 'border-basirah-teal/25 hover:border-basirah-teal'
                }`}
              >
                <span className="block text-base font-semibold text-basirah-teal">{option.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-basirah-teal/80">
                  {option.body}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <Button
          className="mt-6 w-full sm:w-auto"
          disabled={!report.route}
          onClick={() => setStarted(true)}
        >
          <img src="/icons/report-white.png" alt="" width={14} height={16} className="h-4 w-auto" />
          Start this report
        </Button>
      </div>
    );
  }

  const isReview = step === 'review';

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold tracking-[0.08em] text-basirah-teal/70 uppercase">
          Step {index + 1} of {steps.length} · {steps[index]?.title}
        </p>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-basirah-teal/15">
        <div
          className="h-full bg-basirah-teal transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${((index + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 space-y-5">
        {step === 'online_details' && (
          <>
            <Text
              id="online_platform"
              labelText="Which site or app was this on?"
              hintText="Facebook, Instagram, email, a group chat — whatever you know."
              placeholder="Instagram, a Facebook group, email…"
              value={report.online_platform}
              onChange={(v) => set('online_platform', v)}
              error={errors.online_platform}
            />
            <Text
              id="online_url"
              labelText="Link to the post or message (optional)"
              value={report.online_url}
              onChange={(v) => set('online_url', v)}
            />
            <Text
              id="online_account"
              labelText="Account or handle involved (optional)"
              value={report.online_account}
              onChange={(v) => set('online_account', v)}
            />
          </>
        )}

        {step === 'in_person_location' && (
          <>
            <Text
              id="location_kind"
              labelText="What kind of place was it?"
              hintText="A mosque, a street, a school, a workplace, a shop. A neighbourhood is enough."
              placeholder="Mosque parking lot, street outside…"
              value={report.location_kind}
              onChange={(v) => set('location_kind', v)}
              error={errors.location_kind}
            />
            <Text
              id="location_name"
              labelText="Name of the place (optional)"
              value={report.location_name}
              onChange={(v) => set('location_name', v)}
            />
            <Text
              id="location_address"
              labelText="Address or nearest intersection (optional)"
              value={report.location_address}
              onChange={(v) => set('location_address', v)}
            />
          </>
        )}

        {step === 'in_person_people_timing' && (
          <>
            <Text
              id="target"
              labelText="Who or what was targeted? (optional)"
              hintText="A person, a building, a gathering — whatever you can say."
              value={report.target}
              onChange={(v) => set('target', v)}
            />
            <Long
              id="responsible_party"
              labelText="What did the person or people do? (optional)"
              hintText="Describe what they did and said. Leave out how they looked, their background, or their faith. Basirah records behaviour, not appearance."
              value={report.responsible_party}
              onChange={(v) => set('responsible_party', v)}
              rows={3}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                id="occurred_on"
                labelText="Date (optional)"
                type="date"
                value={report.occurred_on}
                onChange={(v) => set('occurred_on', v)}
              />
              <Text
                id="occurred_at"
                labelText="Time (optional)"
                type="time"
                value={report.occurred_at}
                onChange={(v) => set('occurred_at', v)}
              />
            </div>
            <Text
              id="still_happening"
              labelText="Is this still happening? (optional)"
              value={report.still_happening}
              onChange={(v) => set('still_happening', v)}
            />
            <Text
              id="witnesses"
              labelText="Were there witnesses? (optional)"
              value={report.witnesses}
              onChange={(v) => set('witnesses', v)}
            />
            <Text
              id="threats"
              labelText="Were any threats made? (optional)"
              value={report.threats}
              onChange={(v) => set('threats', v)}
            />
            <Text
              id="weapon"
              labelText="Was a weapon involved? (optional)"
              value={report.weapon}
              onChange={(v) => set('weapon', v)}
            />
          </>
        )}

        {step === 'what_happened' && (
          <>
            <Long
              id="description"
              labelText="What happened?"
              hintText="What was said or done, and what happened just before and after. A few sentences is enough."
              value={report.description}
              onChange={(v) => set('description', v)}
              error={errors.description}
              rows={7}
            />
            <Long
              id="other_details"
              labelText="Anything else we should know? (optional)"
              value={report.other_details}
              onChange={(v) => set('other_details', v)}
              rows={3}
            />
          </>
        )}

        {step === 'about_you' && (
          <>
            <p className="text-base leading-relaxed text-basirah-teal">
              So someone can follow up with you. This is not shown to the community, and it is not
              sent to the model that suggests next steps.
            </p>
            <Text
              id="reporter_name"
              labelText="Your name (optional)"
              autoComplete="name"
              value={report.reporter_name}
              onChange={(v) => set('reporter_name', v)}
            />
            <Text
              id="reporter_email"
              labelText="Email (optional)"
              type="email"
              autoComplete="email"
              value={report.reporter_email}
              onChange={(v) => set('reporter_email', v)}
            />
            <Text
              id="reporter_phone"
              labelText="Phone (optional)"
              type="tel"
              autoComplete="tel"
              value={report.reporter_phone}
              onChange={(v) => set('reporter_phone', v)}
            />
            <Text
              id="reporting_for"
              labelText="Are you reporting for yourself or someone else? (optional)"
              value={report.reporting_for}
              onChange={(v) => set('reporting_for', v)}
            />
            <Text
              id="reported_elsewhere"
              labelText="Have you reported this anywhere else? (optional)"
              value={report.reported_elsewhere}
              onChange={(v) => set('reported_elsewhere', v)}
            />
            <Text
              id="support_needed"
              labelText="What support would help right now? (optional)"
              value={report.support_needed}
              onChange={(v) => set('support_needed', v)}
            />
          </>
        )}

        {isReview && (
          <dl className="divide-y divide-basirah-teal/15">
            {REVIEW_ROWS.flatMap(({ key, label }) => {
              const value = report[key];
              if (typeof value !== 'string' || value.trim() === '') return [];
              return [
                <div key={key} className="grid grid-cols-3 gap-4 py-2.5">
                  <dt className="text-sm text-basirah-teal/70">{label}</dt>
                  <dd className="col-span-2 text-base text-basirah-teal">
                    {formatReviewValue(key, value)}
                  </dd>
                </div>,
              ];
            })}
          </dl>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-5 text-base text-basirah-rust">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => (index === 0 ? setStarted(false) : setIndex((i) => i - 1))}
        >
          Back
        </Button>
        {isReview ? (
          <Button variant="primary" onClick={() => void submit()} disabled={submitting}>
            <img
              src="/icons/report-white.png"
              alt=""
              width={14}
              height={16}
              className="h-4 w-auto"
            />
            {submitting ? 'Submitting…' : 'Submit report'}
          </Button>
        ) : (
          <Button onClick={next}>Next</Button>
        )}
      </div>
    </div>
  );
}
