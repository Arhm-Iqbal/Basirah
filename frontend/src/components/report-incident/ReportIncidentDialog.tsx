'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Send, X } from 'lucide-react';
import { generateDemoReference, stepsForRoute, validateStep, type StepId } from '@/lib/report-flow';
import {
  EMPTY_REPORT,
  type IncidentReport,
  type IncidentReportErrors,
  type IncidentRoute,
} from '@/types/incident-report';
import { EvidenceUploader } from './EvidenceUploader';
import { IncidentDescription } from './IncidentDescription';
import { IncidentLocationChoice } from './IncidentLocationChoice';
import { InPersonLocation } from './InPersonLocation';
import { InPersonPeopleTiming } from './InPersonPeopleTiming';
import { OnlineDetails } from './OnlineDetails';
import { ReportConfirmation } from './ReportConfirmation';
import { ReportProgress } from './ReportProgress';
import { ReporterInformation } from './ReporterInformation';
import { ReviewReport } from './ReviewReport';
import { SupportRequest } from './SupportRequest';
import type { StepBodyProps } from './step-body';

type Phase = 'start' | 'steps' | 'submitting' | 'done';

function hasContent(report: IncidentReport): boolean {
  if (report.evidence.length > 0) return true;
  return Object.entries(report).some(
    ([key, value]) => key !== 'route' && typeof value === 'string' && value.trim() !== '',
  );
}

export function ReportIncidentDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef(EMPTY_REPORT.evidence);

  const [report, setReport] = useState<IncidentReport>(EMPTY_REPORT);
  const [errors, setErrors] = useState<IncidentReportErrors>({});
  const [phase, setPhase] = useState<Phase>('start');
  const [activeIndex, setActiveIndex] = useState(0);
  const [reference, setReference] = useState('');
  const [confirmingClose, setConfirmingClose] = useState(false);

  const steps = report.route ? stepsForRoute(report.route) : [];
  const activeStep = steps[activeIndex];

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    evidenceRef.current = report.evidence;
  }, [report.evidence]);

  // Preview URLs live only as long as the dialog does.
  useEffect(
    () => () => {
      for (const item of evidenceRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    },
    [],
  );

  const set = useCallback(<K extends keyof IncidentReport>(key: K, value: IncidentReport[K]) => {
    setReport((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const requestClose = () => {
    if (phase === 'done' || !hasContent(report)) {
      onClose();
      return;
    }
    setConfirmingClose(true);
  };

  const scrollToTop = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0 }));
  };

  const chooseRoute = (route: IncidentRoute) => {
    setReport((current) => ({ ...current, route }));
  };

  const startSteps = () => {
    if (!report.route) return;
    setPhase('steps');
    setActiveIndex(0);
    scrollToTop();
  };

  const goBack = () => {
    if (activeIndex === 0) {
      setPhase('start');
      setErrors({});
      scrollToTop();
      return;
    }
    setActiveIndex((current) => current - 1);
    setErrors({});
    scrollToTop();
  };

  const goForward = () => {
    if (!activeStep) return;
    const stepErrors = validateStep(activeStep.id, report);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      scrollToTop();
      return;
    }
    setErrors({});
    setActiveIndex((current) => Math.min(current + 1, steps.length - 1));
    scrollToTop();
  };

  const editStep = (stepIndex: number) => {
    setActiveIndex(stepIndex);
    setErrors({});
    scrollToTop();
  };

  const submit = async () => {
    const blocking = steps
      .map((step) => validateStep(step.id, report))
      .find((stepErrors) => Object.keys(stepErrors).length > 0);
    if (blocking) {
      setErrors(blocking);
      return;
    }

    setPhase('submitting');

    // TODO: Connect to secure incident-report backend
    await new Promise((resolve) => setTimeout(resolve, 1100));

    setReference(generateDemoReference());
    setPhase('done');
    scrollToTop();
  };

  const bodyProps: StepBodyProps = { report, errors, set };
  const isReviewStep = activeStep?.id === 'review';

  return (
    <dialog
      ref={dialogRef}
      aria-label="Report an Incident"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      className="bg-cream text-ink relative m-0 h-[100dvh] max-h-[100dvh] w-full max-w-none overflow-hidden border-0 p-0 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:w-[calc(100%-3rem)] sm:max-w-[960px] sm:rounded-2xl"
    >
      <div className="flex max-h-[100dvh] flex-col sm:max-h-[90vh]">
        <header className="border-ink/10 bg-cream flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="text-ink/60 text-xs font-semibold tracking-widest uppercase">
              Report an Incident
            </p>
            {phase === 'steps' && activeStep ? (
              <div className="mt-2">
                <ReportProgress steps={steps} activeIndex={activeIndex} />
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={requestClose}
            aria-label="Close reporting form"
            className="text-ink/60 hover:bg-mist hover:text-ink shrink-0 rounded-lg p-2 transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          {phase === 'start' ? (
            <IncidentLocationChoice value={report.route} onChange={chooseRoute} />
          ) : null}

          {phase === 'steps' && activeStep && report.route ? (
            <StepBody
              stepId={activeStep.id}
              route={report.route}
              bodyProps={bodyProps}
              onEdit={editStep}
            />
          ) : null}

          {phase === 'submitting' ? (
            <p className="text-ink/75 py-16 text-center text-sm">Submitting your report&hellip;</p>
          ) : null}

          {phase === 'done' ? <ReportConfirmation reference={reference} onClose={onClose} /> : null}
        </div>

        {phase === 'start' || phase === 'steps' ? (
          <footer className="border-ink/10 bg-cream flex items-center gap-3 border-t px-5 py-4 sm:px-8">
            {phase === 'steps' ? (
              <button
                type="button"
                onClick={goBack}
                className="border-ink/25 text-ink hover:bg-mist flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </button>
            ) : null}

            {phase === 'start' ? (
              <button
                type="button"
                onClick={startSteps}
                disabled={!report.route}
                className="bg-ink ml-auto flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Continue
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : isReviewStep ? (
              <button
                type="button"
                onClick={() => void submit()}
                className="bg-rust ml-auto flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Send className="size-4" aria-hidden />
                Submit Report
              </button>
            ) : (
              <button
                type="button"
                onClick={goForward}
                className="bg-ink ml-auto flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Continue
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </footer>
        ) : null}
      </div>

      {confirmingClose ? (
        <div className="bg-ink/40 absolute inset-0 flex items-center justify-center p-5">
          <div className="border-ink/15 w-full max-w-sm rounded-2xl border bg-white p-6">
            <h2 className="text-ink text-lg font-semibold">Discard this report?</h2>
            <p className="text-ink/75 mt-2 text-sm leading-relaxed">
              What you have written will be cleared. Nothing has been saved anywhere.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmingClose(false)}
                className="bg-ink flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border-ink/25 text-rust hover:bg-mist flex-1 rounded-xl border bg-white px-4 py-3 text-sm font-semibold transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function StepBody({
  stepId,
  route,
  bodyProps,
  onEdit,
}: {
  stepId: StepId;
  route: IncidentRoute;
  bodyProps: StepBodyProps;
  onEdit: (stepIndex: number) => void;
}) {
  const { report, set } = bodyProps;

  switch (stepId) {
    case 'online_details':
      return <OnlineDetails {...bodyProps} />;
    case 'in_person_location':
      return <InPersonLocation {...bodyProps} />;
    case 'in_person_people_timing':
      return <InPersonPeopleTiming {...bodyProps} />;
    case 'what_happened':
      return <IncidentDescription route={route} {...bodyProps} />;
    case 'evidence':
      return (
        <EvidenceUploader
          heading="Upload screenshots or other evidence"
          description="If you have screenshots, images, documents, or video related to the incident, you can add them here."
          items={report.evidence}
          onChange={(items) => set('evidence', items)}
        />
      );
    case 'about_you':
      return (
        <div className="space-y-5">
          <ReporterInformation {...bodyProps} />
          <SupportRequest {...bodyProps} />
        </div>
      );
    case 'evidence_contact':
      return (
        <div className="space-y-5">
          <EvidenceUploader
            heading="Add pictures, videos, or documents"
            description="Upload any evidence related to what happened."
            items={report.evidence}
            onChange={(items) => set('evidence', items)}
          />
          <ReporterInformation {...bodyProps} />
          <SupportRequest {...bodyProps} />
        </div>
      );
    case 'review':
      return <ReviewReport report={report} route={route} onEdit={onEdit} />;
    default: {
      const unhandled: never = stepId;
      throw new Error(`Unhandled step: ${String(unhandled)}`);
    }
  }
}
