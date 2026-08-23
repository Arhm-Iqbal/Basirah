export type IncidentRoute = 'online' | 'in_person';

export type EvidenceItem = {
  id: string;
  file: File;
  /** Object URL for image thumbnails only. Revoked when the item or the dialog goes away. */
  previewUrl: string | null;
};

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
  responsible_description: string;

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

  evidence: EvidenceItem[];

  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  reporting_for: string;

  reported_elsewhere: string;
  existing_reference: string;

  support_needed: string;
  anything_else: string;
};

export type IncidentReportErrors = Partial<Record<keyof IncidentReport, string>>;

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
  responsible_description: '',

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

  evidence: [],

  reporter_name: '',
  reporter_email: '',
  reporter_phone: '',
  reporting_for: '',

  reported_elsewhere: '',
  existing_reference: '',

  support_needed: '',
  anything_else: '',
};
