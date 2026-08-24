'use client';

import { Check, FileText, Globe, MapPin, ShieldOff, TriangleAlert, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { IncidentActionPlan } from '@basirah/shared';

import { ActionPlanView } from '@/components/action-plan-view';
import { Button } from '@/components/button-link';
import { apiFetch } from '@/lib/api-base';
import { createOptionalClient } from '@/lib/supabase/client';
import { TidyWriting } from '@/components/tidy-writing';
import { TurnstileWidget } from '@/components/turnstile-widget';
import {
  EMPTY_REPORT,
  stepsForRoute,
  loadContactLocally,
  saveContactLocally,
  toApiPayload,
  validateStep,
  type IncidentReport,
  type IncidentRoute,
  type ReportPrivacy,
  type ReportErrors,
  type StepId,
} from '@/lib/report-flow';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

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

// Selection has to survive a glance on a phone held by someone upset, so the chosen card
// inverts to a solid fill with a check rather than shifting by a few percent of tint.
function ChoiceCard({
  icon: Icon,
  title,
  body,
  selected,
  onClick,
}: {
  icon: typeof MapPin;
  title: string;
  body: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-start transition-[background-color,border-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none ${
        selected
          ? 'border-basirah-teal bg-basirah-teal shadow-[0_8px_20px_-10px_rgb(4_51_52_/_55%)]'
          : 'border-basirah-teal/20 bg-white hover:border-basirah-teal/60 hover:bg-basirah-cream/45'
      }`}
    >
      <span
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 motion-reduce:transition-none ${
          selected ? 'bg-white/15 text-white' : 'bg-basirah-cream text-basirah-teal'
        }`}
      >
        <Icon className="size-4.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-base font-semibold text-balance ${selected ? 'text-white' : 'text-basirah-teal'}`}
        >
          {title}
        </span>
        <span
          className={`mt-0.5 block text-sm leading-relaxed text-pretty ${selected ? 'text-white/75' : 'text-basirah-teal/70'}`}
        >
          {body}
        </span>
      </span>

      <span
        aria-hidden
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-opacity duration-150 motion-reduce:transition-none ${
          selected ? 'bg-white opacity-100' : 'opacity-0'
        }`}
      >
        <Check className="size-3.5 text-basirah-teal" strokeWidth={3} />
      </span>
    </button>
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
                  ? 'border-basirah-teal bg-basirah-cream'
                  : 'border-basirah-teal/25 bg-white hover:border-basirah-teal/60 hover:bg-basirah-cream/45'
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
                  ? 'border-basirah-teal bg-basirah-cream'
                  : 'border-basirah-teal/25 bg-white hover:border-basirah-teal/60 hover:bg-basirah-cream/45'
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

type ReportWizardProps = {
  accountContext?: boolean;
};

type PrivateField =
  | 'reporter_name'
  | 'reporter_email'
  | 'reporter_phone'
  | 'reporting_for'
  | 'reported_elsewhere'
  | 'existing_reference'
  | 'support_needed';

const PRIVATE_FIELDS: PrivateField[] = [
  'reporter_name',
  'reporter_email',
  'reporter_phone',
  'reporting_for',
  'reported_elsewhere',
  'existing_reference',
  'support_needed',
];

export function ReportWizard({ accountContext = false }: ReportWizardProps) {
  const router = useRouter();
  const [report, setReport] = useState<IncidentReport>(EMPTY_REPORT);
  const [privacy, setPrivacy] = useState<ReportPrivacy | null>(accountContext ? null : 'anonymous');
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<ReportErrors>({});
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [actionPlan, setActionPlan] = useState<IncidentActionPlan | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileAttempt, setTurnstileAttempt] = useState(0);

  const set = <K extends keyof IncidentReport>(key: K, value: IncidentReport[K]) => {
    setReport((r) => ({ ...r, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const choosePrivacy = (nextPrivacy: ReportPrivacy) => {
    setPrivacy(nextPrivacy);
    setErrors({});
    setError(null);
    setTurnstileToken(null);
    setTurnstileError(null);
    setTurnstileAttempt((attempt) => attempt + 1);
    setIndex(0);

    if (nextPrivacy === 'account') {
      const saved = loadContactLocally();
      if (Object.keys(saved).length > 0) setReport((current) => ({ ...current, ...saved }));
      return;
    }

    setReport((current) => {
      const scrubbed = { ...current };
      for (const key of PRIVATE_FIELDS) scrubbed[key] = '';
      return scrubbed;
    });
  };

  const steps = report.route && privacy ? stepsForRoute(report.route, privacy) : [];
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
    if (!privacy) return;

    const isAnonymous = privacy === 'anonymous';
    if (isAnonymous && TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Complete the security check before submitting this report.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const supabase = isAnonymous ? null : createOptionalClient();
      const token = supabase
        ? (await supabase.auth.getSession()).data.session?.access_token
        : undefined;

      if (!isAnonymous && !token) {
        throw new Error('You are signed out. Sign in again before submitting this report.');
      }

      const payload: Record<string, unknown> = {
        ...toApiPayload(report, { anonymous: isAnonymous }),
      };
      if (isAnonymous) {
        payload.turnstile_token = TURNSTILE_SITE_KEY ? turnstileToken : 'unconfigured';
      }

      const res = await apiFetch(isAnonymous ? '/v1/tips' : '/v1/incidents', {
        method: 'POST',
        credentials: isAnonymous ? 'omit' : 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(!isAnonymous && token ? { Authorization: `Bearer ${token}` } : {}),
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
      if (!isAnonymous) {
        saveContactLocally(report);
        router.push(`/app/reports/${created.id}/next-steps`);
        return;
      }

      setClaimCode(created.claim_code ?? null);
      setActionPlan(created.actions ?? null);
      setCreatedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your report could not be submitted.');
    } finally {
      if (isAnonymous && TURNSTILE_SITE_KEY) {
        setTurnstileToken(null);
        setTurnstileAttempt((attempt) => attempt + 1);
      }
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
        <div className="flex items-start gap-3 rounded-xl border border-basirah-rust/35 bg-basirah-rust/10 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-basirah-rust" aria-hidden />
          <p className="text-base leading-relaxed text-pretty text-basirah-teal">
            <span className="font-semibold text-basirah-rust">In immediate danger? Call 911.</span>{' '}
            This form is for documentation, not emergency response.
          </p>
        </div>

        {accountContext ? (
          <fieldset className="mt-8">
            <legend className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
              How would you like to submit?
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                icon={ShieldOff}
                title="Anonymous"
                body="No name, email, or contact details."
                selected={privacy === 'anonymous'}
                onClick={() => choosePrivacy('anonymous')}
              />
              <ChoiceCard
                icon={UserRound}
                title="Save to my account"
                body="Appears in your reports. Details stay optional."
                selected={privacy === 'account'}
                onClick={() => choosePrivacy('account')}
              />
            </div>
          </fieldset>
        ) : (
          // Nothing to choose here -- this entry point is always anonymous -- so it states the
          // fact instead of dressing it as a one-option question.
          <p className="mt-8 flex items-center gap-2.5 text-base font-semibold text-basirah-teal">
            <ShieldOff className="size-4.5 shrink-0 text-basirah-teal/70" aria-hidden />
            Anonymous — no name, email, or contact details.
          </p>
        )}

        <fieldset className="mt-8">
          <legend className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
            Where did this happen?
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: 'in_person',
                  icon: MapPin,
                  title: 'In person',
                  body: 'A mosque, public, work, or school.',
                },
                {
                  value: 'online',
                  icon: Globe,
                  title: 'Online',
                  body: 'Social media, messages, email, or a site.',
                },
              ] as { value: IncidentRoute; icon: typeof MapPin; title: string; body: string }[]
            ).map((option) => (
              <ChoiceCard
                key={option.value}
                icon={option.icon}
                title={option.title}
                body={option.body}
                selected={report.route === option.value}
                onClick={() => set('route', option.value)}
              />
            ))}
          </div>
        </fieldset>

        {/* The default disabled treatment is opacity alone, which on teal reads as broken
            rather than as not-yet. This one keeps its edges and stays legible. */}
        <Button
          size="lg"
          className="mt-8 w-full disabled:bg-basirah-teal/15 disabled:text-basirah-teal/65 disabled:opacity-100 sm:w-auto"
          disabled={!report.route || !privacy}
          onClick={() => setStarted(true)}
        >
          <FileText className="size-4.5" aria-hidden />
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
              Your optional name, email, and phone stay on this device to prefill your next account
              report. They are not attached to this report, shown to the community, or sent to the
              model that suggests next steps. Your remaining answers on this step are saved with the
              incident so Basirah can understand what support is needed.
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
          <>
            <div className="rounded-lg border border-basirah-teal/20 bg-basirah-teal/5 p-4">
              <p className="text-sm font-semibold text-basirah-teal">
                {privacy === 'anonymous' ? 'Submitting anonymously' : 'Saving to your account'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-basirah-teal/75">
                {privacy === 'anonymous'
                  ? 'Your account and contact details will not be attached to this report.'
                  : 'This report will appear in My reports and can be managed from your profile. Any name or contact details shown below remain on this device only.'}
              </p>
            </div>
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
          </>
        )}

        {isReview && privacy === 'anonymous' && TURNSTILE_SITE_KEY && (
          <div className="rounded-lg border border-basirah-teal/20 bg-white p-4">
            <p className="text-sm font-semibold text-basirah-teal">Security check</p>
            <p className="mt-1 text-sm leading-relaxed text-basirah-teal/70">
              This helps keep automated submissions out of the reporting queue.
            </p>
            <TurnstileWidget
              key={turnstileAttempt}
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setTurnstileToken}
              onError={setTurnstileError}
            />
            {turnstileError && (
              <div className="mt-2">
                <p role="alert" className="text-sm font-medium text-basirah-rust">
                  {turnstileError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTurnstileError(null);
                    setTurnstileToken(null);
                    setTurnstileAttempt((attempt) => attempt + 1);
                  }}
                  className="mt-2 cursor-pointer text-sm font-semibold text-basirah-teal underline underline-offset-4"
                >
                  Try the security check again
                </button>
              </div>
            )}
          </div>
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
          <Button
            variant="primary"
            onClick={() => void submit()}
            disabled={submitting || Boolean(TURNSTILE_SITE_KEY && !turnstileToken)}
          >
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
