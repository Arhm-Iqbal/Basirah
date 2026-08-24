'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { IncidentActionPlan } from '@basirah/shared';

import { ActionPlanView } from '@/components/action-plan-view';
import { Button } from '@/components/button-link';
import { EvidenceUploader } from '@/components/evidence-uploader';
import { downloadReport, fetchIncidentActions } from '@/lib/queries';

export function ReportNextSteps({ incidentId }: { incidentId: string }) {
  const [plan, setPlan] = useState<IncidentActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPlan(await fetchIncidentActions(incidentId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load your next steps.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="border-b border-basirah-teal/15 pb-5">
        <p className="text-sm font-semibold tracking-[0.12em] text-basirah-teal/70 uppercase">
          Report received
        </p>
        <h1 className="mt-1.5 font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-basirah-teal sm:text-[2rem]">
          Your report is saved
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-basirah-teal/80">
          It goes to your community&apos;s verification team first. Nothing becomes a community-wide
          alert until a person has verified it.
        </p>
        <p className="mt-2 break-all text-sm text-basirah-teal/60">Reference {incidentId}</p>
      </header>

      <div className="mt-6">
        {loading && (
          <div className="rounded-lg border border-basirah-teal/20 bg-white p-5" role="status">
            <p className="text-base text-basirah-teal/70">Loading the right next steps…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-basirah-rust/30 bg-white p-5">
            <p role="alert" className="text-base text-basirah-rust">
              {error}
            </p>
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        )}

        {!loading && plan && <ActionPlanView plan={plan} />}
      </div>

      <div className="mt-8 border-t border-basirah-teal/15 pt-6">
        <EvidenceUploader incidentId={incidentId} />
      </div>

      <section className="mt-8 border-t border-basirah-teal/15 pt-6">
        <h2 className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
          Keep a copy
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-basirah-teal/70">
          A PDF of the report is saved to your profile. Your name, email, and phone stay on this
          device and are not included in the PDF.
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            setDownloadError(null);
            try {
              await downloadReport(incidentId);
            } catch (cause) {
              setDownloadError(
                cause instanceof Error ? cause.message : 'Could not download the PDF.',
              );
            } finally {
              setDownloading(false);
            }
          }}
        >
          {downloading ? 'Preparing…' : 'Download PDF'}
        </Button>
        {downloadError && <p className="mt-2 text-sm text-basirah-rust">{downloadError}</p>}
      </section>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-basirah-teal/15 pt-6">
        <Link
          href="/app/profile?view=reports"
          className="inline-flex min-h-11 items-center rounded-md bg-basirah-teal px-5 text-base font-semibold text-white transition-colors hover:bg-[#0a4749]"
        >
          View my reports
        </Link>
        <Link
          href="/app/report"
          className="inline-flex min-h-11 items-center rounded-md border border-basirah-teal/30 bg-white px-5 text-base font-semibold text-basirah-teal transition-colors hover:border-basirah-teal hover:bg-basirah-cream"
        >
          File another report
        </Link>
      </div>
    </div>
  );
}
