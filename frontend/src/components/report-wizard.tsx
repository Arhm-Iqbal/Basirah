'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { IncidentActionPlan } from '@basirah/shared';

import { ActionPlanView } from '@/components/action-plan-view';
import { Button } from '@/components/button-link';
import { apiFetch } from '@/lib/api-base';
import { createOptionalClient } from '@/lib/supabase/client';
import { TidyWriting } from '@/components/tidy-writing';
import {
  EMPTY_REPORT,
  stepsForRoute,
  loadContactLocally,
  saveContactLocally,
  toApiPayload,
  validateStep,
  type IncidentReport,
  type IncidentRoute,
  type ReportErrors,
  type StepId,
} from '@/lib/report-flow';

const field =
  'mt-1.5 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-basirah-teal/45 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] aria-invalid:border-basirah-rust aria-invalid:shadow-[0_0_0_3px_rgb(148_33_6_/_18%)] motion-reduce:transition-none';
const labelClass = 'block text-base font-semibold text-basirah-teal';
const hintClass = 'mt-1 text-sm leading-relaxed text-basirah-teal/75';

const REVIEW_ROWS: { key: keyof IncidentReport; label: string }[] = [
  { key: 'route', label: 'Where it happened' },
  { key: 'online_platform', label: 'Site or app' },
  { key: 'online_harm', label: 'What happened online' },
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
  if (key === 'online_platform') {
    return PLATFORMS.find((option) => option.value === value)?.label ?? value;
  }
  if (key === 'online_harm') {
    return value
      .split(',')
      .map(
        (part) => ONLINE_HARMS.find((option) => option.value === part.trim())?.label ?? part.trim(),
      )
      .join(', ');
  }
  if (key === 'location_kind') {
    return PLACE_KINDS.find((option) => option.value === value)?.label ?? value;
  }
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

// Most of what this form asks has a small, known set of answers. Free text there costs the
// reporter effort and makes the data unusable for the aggregate reporting the incidents
// are collected for, so anything answerable from a list is answered from a list.
// Native radio and checkbox inputs, visually hidden and redrawn. Keeping the real input
// is what gives arrow-key navigation within the group, space/enter activation, and correct
// screen-reader announcement -- none of which a styled button provides for free.
const optionRow =
  'flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-base transition-colors duration-150 motion-reduce:transition-none';

function OptionMark({ checked, multi }: { checked: boolean; multi?: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 transition-colors duration-150 motion-reduce:transition-none ${
        multi ? 'rounded' : 'rounded-full'
      } ${checked ? 'border-basirah-teal bg-basirah-teal' : 'border-basirah-teal/40 bg-white'}`}
    >
      {checked &&
        (multi ? (
          <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span className="size-2 rounded-full bg-white" />
        ))}
    </span>
  );
}

function Choice({
  legend,
  hintText,
  value,
  onChange,
  options,
  name,
  error,
}: {
  legend: string;
  hintText?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  name: string;
  error?: string;
}) {
  const hintId = hintText ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset
      id={name}
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className="rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
    >
      <legend className={labelClass}>{legend}</legend>
      {hintText && (
        <p id={hintId} className={hintClass}>
          {hintText}
        </p>
      )}
      <div className="mt-2.5 flex flex-col gap-2">
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={`${optionRow} ${
                checked
                  ? 'border-basirah-teal bg-basirah-teal/5'
                  : 'border-basirah-teal/25 hover:border-basirah-teal/50 hover:bg-basirah-teal/[0.03]'
              } has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-basirah-teal`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <OptionMark checked={checked} />
              <span className="text-basirah-teal">{o.label}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-basirah-rust">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// Stored as a comma-joined string so it rides in details alongside the other answers
// without needing a shape change.
function MultiChoice({
  legend,
  hintText,
  value,
  onChange,
  options,
  name,
  error,
}: {
  legend: string;
  hintText?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  name: string;
  error?: string;
}) {
  const hintId = hintText ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const selected = value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    onChange(next.join(', '));
  };
  return (
    <fieldset
      id={name}
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className="rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
    >
      <legend className={labelClass}>{legend}</legend>
      {hintText && (
        <p id={hintId} className={hintClass}>
          {hintText}
        </p>
      )}
      <div className="mt-2.5 flex flex-col gap-2">
        {options.map((o) => {
          const checked = selected.includes(o.value);
          return (
            <label
              key={o.value}
              className={`${optionRow} ${
                checked
                  ? 'border-basirah-teal bg-basirah-teal/5'
                  : 'border-basirah-teal/25 hover:border-basirah-teal/50 hover:bg-basirah-teal/[0.03]'
              } has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-basirah-teal`}
            >
              <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={() => toggle(o.value)}
                className="sr-only"
              />
              <OptionMark checked={checked} multi />
              <span className="text-basirah-teal">{o.label}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-basirah-rust">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

const PLACE_KINDS = [
  { value: 'mosque', label: 'Mosque' },
  { value: 'street', label: 'Street or public space' },
  { value: 'school', label: 'School or campus' },
  { value: 'workplace', label: 'Workplace' },
  { value: 'shop', label: 'Shop or business' },
  { value: 'transit', label: 'Transit' },
  { value: 'home', label: 'Home' },
  { value: 'other', label: 'Somewhere else' },
];

const REPORTING_FOR = [
  { value: 'myself', label: 'Myself' },
  { value: 'someone_else', label: 'Someone else' },
  { value: 'organisation', label: 'An organisation' },
  { value: 'witness', label: 'I witnessed it' },
];

const SUPPORT = [
  { value: 'police', label: 'Help contacting police' },
  { value: 'legal', label: 'Legal advice' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'mosque', label: 'Support from my mosque' },
  { value: 'security', label: 'Security advice' },
  { value: 'none', label: 'Nothing right now' },
];

const ONLINE_HARMS = [
  { value: 'hateful_content', label: 'Hate speech or anti-Muslim content' },
  { value: 'harassment', label: 'Harassment or repeated targeting' },
  { value: 'threats', label: 'A threat of harm' },
  { value: 'doxxing', label: 'Private information was exposed' },
  { value: 'impersonation', label: 'Impersonation or a fake account' },
  { value: 'coordinated_abuse', label: 'Several accounts were involved' },
  { value: 'unsure', label: 'I am not sure how to classify it' },
];

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'threads', label: 'Threads' },
  { value: 'x', label: 'X / Twitter' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'discord', label: 'Discord' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'A website or forum' },
  { value: 'other', label: 'Somewhere else' },
];

export function ReportWizard() {
  const router = useRouter();
  const [report, setReport] = useState<IncidentReport>(EMPTY_REPORT);
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<ReportErrors>({});
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [actionPlan, setActionPlan] = useState<IncidentActionPlan | null>(null);

  useEffect(() => {
    const saved = loadContactLocally();
    if (Object.keys(saved).length > 0) setReport((r) => ({ ...r, ...saved }));
  }, []);

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
      const supabase = createOptionalClient();
      const token = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;

      const payload: Record<string, unknown> = { ...toApiPayload(report) };
      if (!token) payload.turnstile_token = 'unconfigured';

      const res = await apiFetch(token ? '/v1/incidents' : '/v1/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (body as { error?: { message?: string } } | null)?.error?.message ??
            'Your report could not be submitted.',
        );
      }

      const created = body as {
        id: string;
        claim_code?: string;
        actions?: IncidentActionPlan;
      };
      saveContactLocally(report);

      if (token) {
        router.push(`/app/reports/${created.id}/next-steps`);
        return;
      }

      setClaimCode(created.claim_code ?? null);
      setActionPlan(created.actions ?? null);
      setCreatedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your report could not be submitted.');
    } finally {
      setSubmitting(false);
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

        {claimCode && (
          <div className="mt-5 rounded-lg border border-basirah-rust/30 bg-basirah-rust/5 p-4">
            <p className="text-sm font-semibold text-basirah-rust">Save this code now</p>
            <p className="mt-1 text-sm leading-relaxed text-basirah-teal/75">
              It is the only way to check on this report. We stored no account and no contact
              details, so we cannot look it up for you without it.
            </p>
            <p className="mt-3 font-mono text-xl tracking-widest text-basirah-teal">{claimCode}</p>
          </div>
        )}

        <div className="mt-6 border-t border-basirah-teal/15 pt-5">
          {actionPlan ? (
            <ActionPlanView plan={actionPlan} />
          ) : (
            <p className="text-base text-basirah-teal/70">
              Next-step suggestions are unavailable right now. Your report is saved.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div>
        <div className="rounded-lg border border-basirah-rust/30 bg-basirah-rust/8 p-4">
          <h2 className="text-base font-semibold text-basirah-rust">
            Are you in immediate danger?
          </h2>
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
                <span className="block text-base font-semibold text-basirah-teal">
                  {option.title}
                </span>
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
            <Choice
              legend="Where online did this happen?"
              name="online_platform"
              value={report.online_platform}
              onChange={(v) => set('online_platform', v)}
              options={PLATFORMS}
              error={errors.online_platform}
            />
            <MultiChoice
              legend="What kind of online harm was it?"
              hintText="Choose every option that fits. You can pick ‘not sure’."
              value={report.online_harm}
              onChange={(v) => set('online_harm', v)}
              options={ONLINE_HARMS}
              name="online_harm"
              error={errors.online_harm}
            />
            <Text
              id="online_url"
              labelText="Link to the post or message (optional)"
              value={report.online_url}
              onChange={(v) => set('online_url', v)}
              error={errors.online_url}
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
            <Choice
              legend="What kind of place was it?"
              name="location_kind"
              value={report.location_kind}
              onChange={(v) => set('location_kind', v)}
              options={PLACE_KINDS}
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
            <Choice
              legend="Is this still happening?"
              name="still_happening"
              value={report.still_happening}
              onChange={(v) => set('still_happening', v)}
              options={YES_NO}
            />
            <Choice
              legend="Were there witnesses?"
              name="witnesses"
              value={report.witnesses}
              onChange={(v) => set('witnesses', v)}
              options={YES_NO}
            />
            <Choice
              legend="Were any threats made?"
              name="threats"
              value={report.threats}
              onChange={(v) => set('threats', v)}
              options={YES_NO}
            />
            <Choice
              legend="Was a weapon involved?"
              name="weapon"
              value={report.weapon}
              onChange={(v) => set('weapon', v)}
              options={YES_NO}
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
            <TidyWriting text={report.description} onAccept={(v) => set('description', v)} />
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
            <Choice
              legend="Who are you reporting for?"
              name="reporting_for"
              value={report.reporting_for}
              onChange={(v) => set('reporting_for', v)}
              options={REPORTING_FOR}
            />
            <Choice
              legend="Have you reported this anywhere else?"
              name="reported_elsewhere"
              value={report.reported_elsewhere}
              onChange={(v) => set('reported_elsewhere', v)}
              options={YES_NO}
            />
            <MultiChoice
              legend="What support would help right now?"
              hintText="Choose as many as apply."
              value={report.support_needed}
              onChange={(v) => set('support_needed', v)}
              options={SUPPORT}
              name="support_needed"
            />
          </>
        )}

        {isReview && (
          <dl className="divide-y divide-basirah-teal/15">
            {REVIEW_ROWS.flatMap(({ key, label }) => {
              const value = report[key];
              if (typeof value !== 'string' || value.trim() === '') return [];
              return [
                <div key={key} className="py-2.5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-basirah-teal/70">{label}</dt>
                  <dd className="mt-0.5 text-base break-words text-basirah-teal sm:col-span-2 sm:mt-0">
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
