'use client';

import { Check, Globe, MapPin } from 'lucide-react';
import type { IncidentRoute } from '@/types/incident-report';
import { EmergencyNotice } from './EmergencyNotice';

const ROUTES: {
  value: IncidentRoute;
  label: string;
  description: string;
  Icon: typeof Globe;
}[] = [
  {
    value: 'online',
    label: 'Online',
    description:
      'Social media, websites, email, messaging platforms, online communities, or another digital space.',
    Icon: Globe,
  },
  {
    value: 'in_person',
    label: 'In Person',
    description:
      'A mosque, school, workplace, business, street, event, public space, or another physical location.',
    Icon: MapPin,
  },
];

export function IncidentLocationChoice({
  value,
  onChange,
}: {
  value: IncidentRoute | null;
  onChange: (route: IncidentRoute) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-ink text-2xl font-semibold tracking-tight sm:text-3xl">
          Report an Incident
        </h2>
        <p className="text-ink/75 mt-2.5 leading-relaxed">
          Use this form to document Islamophobia, hate, harassment, threats, discrimination,
          suspicious activity, or another safety concern.
        </p>
      </div>

      <EmergencyNotice />

      <fieldset>
        <legend className="text-ink w-full text-center text-xl font-semibold tracking-tight sm:text-2xl">
          Where did the incident occur?
        </legend>

        <div
          role="radiogroup"
          aria-label="Where did the incident occur?"
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          {ROUTES.map(({ value: routeValue, label, description, Icon }) => {
            const selected = value === routeValue;

            return (
              <button
                key={routeValue}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(routeValue)}
                className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-colors sm:p-6 ${
                  selected ? 'border-ink bg-mist' : 'border-ink/15 hover:border-ink/40 bg-white'
                }`}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <Icon className="text-ink size-7" aria-hidden />
                  {selected ? (
                    <span
                      aria-hidden
                      className="bg-ink flex size-6 shrink-0 items-center justify-center rounded-full text-white"
                    >
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  ) : null}
                </span>
                <span className="text-ink mt-3 text-lg font-semibold">{label}</span>
                <span className="text-ink/70 mt-1.5 text-sm leading-relaxed">{description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
