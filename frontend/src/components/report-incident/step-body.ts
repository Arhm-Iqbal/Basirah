import type { IncidentReport, IncidentReportErrors } from '@/types/incident-report';

export type StepBodyProps = {
  report: IncidentReport;
  errors: IncidentReportErrors;
  set: <K extends keyof IncidentReport>(key: K, value: IncidentReport[K]) => void;
};
