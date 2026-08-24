export type IncidentRoute = 'online' | 'in_person';

export type StepId =
  | 'online_details'
  | 'in_person_location'
  | 'in_person_people_timing'
  | 'what_happened'
  | 'about_you'
  | 'review';

export type StepDefinition = { id: StepId; title: string };

const ONLINE_STEPS: StepDefinition[] = [
  { id: 'online_details', title: 'Online details' },
  { id: 'what_happened', title: 'What happened' },
  { id: 'about_you', title: 'About you' },
  { id: 'review', title: 'Review' },
];

const IN_PERSON_STEPS: StepDefinition[] = [
  { id: 'in_person_location', title: 'Location' },
  { id: 'in_person_people_timing', title: 'People & timing' },
  { id: 'what_happened', title: 'What happened' },
  { id: 'about_you', title: 'About you' },
  { id: 'review', title: 'Review' },
];

export function stepsForRoute(route: IncidentRoute): StepDefinition[] {
  return route === 'online' ? ONLINE_STEPS : IN_PERSON_STEPS;
}

export type IncidentReport = {
  route: IncidentRoute | null;
  online_platform: string;
  online_url: string;
  online_account: string;
  location_kind: string;
  location_name: string;
  location_address: string;
  target: string;
  responsible_party: string;
  occurred_on: string;
  occurred_at: string;
  timing_note: string;
  still_happening: string;
  duration: string;
  witnesses: string;
  witness_details: string;
  threats: string;
  weapon: string;
  description: string;
  before_context: string;
  after_context: string;
  other_details: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporting_for: string;
  reported_elsewhere: string;
  existing_reference: string;
  support_needed: string;
  anything_else: string;
};

export type ReportErrors = Partial<Record<keyof IncidentReport, string>>;

export const EMPTY_REPORT: IncidentReport = {
  route: null,
  online_platform: '',
  online_url: '',
  online_account: '',
  location_kind: '',
  location_name: '',
  location_address: '',
  target: '',
  responsible_party: '',
  occurred_on: '',
  occurred_at: '',
  timing_note: '',
  still_happening: '',
  duration: '',
  witnesses: '',
  witness_details: '',
  threats: '',
  weapon: '',
  description: '',
  before_context: '',
  after_context: '',
  other_details: '',
  reporter_name: '',
  reporter_email: '',
  reporter_phone: '',
  reporting_for: '',
  reported_elsewhere: '',
  existing_reference: '',
  support_needed: '',
  anything_else: '',
};

// Deliberately permissive. Someone reporting a hate incident may not have a date, a URL, a
// name, or any idea who was responsible, and refusing their report over a missing field is
// worse than storing an incomplete one.
export function validateStep(stepId: StepId, report: IncidentReport): ReportErrors {
  const errors: ReportErrors = {};

  if (stepId === 'online_details' && report.online_platform.trim() === '') {
    errors.online_platform = 'Please tell us roughly where online this happened.';
  }
  if (
    stepId === 'in_person_location' &&
    report.location_kind.trim() === '' &&
    report.location_address.trim() === ''
  ) {
    errors.location_kind = 'Please give us some idea of where this happened.';
  }
  if (stepId === 'what_happened' && report.description.trim().length < 10) {
    errors.description = 'Please describe what happened, even briefly.';
  }

  return errors;
}

// Everything the API takes as a first-class column is lifted out; the rest rides in
// details, which is what that jsonb column exists for until the form settles.
export function toApiPayload(report: IncidentReport) {
  const occurred =
    report.occurred_on !== ''
      ? new Date(`${report.occurred_on}T${report.occurred_at || '00:00'}`).toISOString()
      : undefined;

  const details: Record<string, string> = {};
  const detailKeys: (keyof IncidentReport)[] = [
    'online_account',
    'location_kind',
    'location_name',
    'target',
    'responsible_party',
    'timing_note',
    'still_happening',
    'duration',
    'witnesses',
    'witness_details',
    'threats',
    'weapon',
    'before_context',
    'after_context',
    'other_details',
    'reporter_name',
    'reporter_email',
    'reporter_phone',
    'reporting_for',
    'reported_elsewhere',
    'existing_reference',
    'support_needed',
    'anything_else',
  ];
  for (const key of detailKeys) {
    const value = report[key];
    if (typeof value === 'string' && value.trim() !== '') details[key] = value.trim();
  }

  const base = {
    channel: report.route,
    description: report.description.trim(),
    occurred_at: occurred,
    details,
  };

  return report.route === 'online'
    ? {
        ...base,
        platform: report.online_platform.trim() || undefined,
        url: report.online_url.trim() || undefined,
      }
    : { ...base, location_description: report.location_address.trim() || undefined };
}
