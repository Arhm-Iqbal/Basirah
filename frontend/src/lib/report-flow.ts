import type { IncidentReport, IncidentReportErrors, IncidentRoute } from '@/types/incident-report';

export type StepId =
  | 'online_details'
  | 'in_person_location'
  | 'in_person_people_timing'
  | 'what_happened'
  | 'evidence'
  | 'about_you'
  | 'evidence_contact'
  | 'review';

export type StepDefinition = {
  id: StepId;
  /** Shown on mobile as the current step name, and in the desktop rail. */
  title: string;
};

const ONLINE_STEPS: StepDefinition[] = [
  { id: 'online_details', title: 'Online Details' },
  { id: 'what_happened', title: 'What Happened' },
  { id: 'evidence', title: 'Evidence' },
  { id: 'about_you', title: 'About You' },
  { id: 'review', title: 'Review' },
];

const IN_PERSON_STEPS: StepDefinition[] = [
  { id: 'in_person_location', title: 'Location' },
  { id: 'in_person_people_timing', title: 'People & Timing' },
  { id: 'what_happened', title: 'What Happened' },
  { id: 'evidence_contact', title: 'Evidence & Contact' },
  { id: 'review', title: 'Review' },
];

export function stepsForRoute(route: IncidentRoute): StepDefinition[] {
  switch (route) {
    case 'online':
      return ONLINE_STEPS;
    case 'in_person':
      return IN_PERSON_STEPS;
    default: {
      const unhandled: never = route;
      throw new Error(`Unhandled route: ${String(unhandled)}`);
    }
  }
}

/**
 * Deliberately permissive. Someone reporting a hate incident may not have a date, a URL, a name,
 * or any idea who was responsible, and refusing their report over a missing field is worse than
 * storing an incomplete one.
 */
export function validateStep(stepId: StepId, report: IncidentReport): IncidentReportErrors {
  const errors: IncidentReportErrors = {};

  switch (stepId) {
    case 'online_details': {
      if (report.online_platform.trim() === '') {
        errors.online_platform = 'Please tell us roughly where online this happened.';
      }
      return errors;
    }
    case 'in_person_location': {
      if (report.location_kind.trim() === '' && report.location_address.trim() === '') {
        errors.location_kind = 'Please give us some idea of where this happened.';
      }
      return errors;
    }
    case 'what_happened': {
      if (report.description.trim().length < 10) {
        errors.description = 'Please describe what happened, even briefly.';
      }
      return errors;
    }
    case 'in_person_people_timing':
    case 'evidence':
    case 'about_you':
    case 'evidence_contact':
    case 'review':
      return errors;
    default: {
      const unhandled: never = stepId;
      throw new Error(`Unhandled step: ${String(unhandled)}`);
    }
  }
}

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Cosmetic identifier so the person has something to write down. It is not a lookup key, because
 * this prototype does not persist anything.
 */
export function generateDemoReference(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(
    bytes,
    (byte) => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length],
  ).join('');
  return `MCSN-${new Date().getFullYear()}-${suffix}`;
}
