'use client';

import { Check } from 'lucide-react';
import type { StepDefinition } from '@/lib/report-flow';

export function ReportProgress({
  steps,
  activeIndex,
}: {
  steps: StepDefinition[];
  activeIndex: number;
}) {
  const active = steps[activeIndex];

  return (
    <div>
      <p className="text-ink/70 text-sm font-medium sm:hidden">
        Step {activeIndex + 1} of {steps.length}
        <span className="text-ink ml-2 font-semibold">{active.title}</span>
      </p>

      <ol className="hidden flex-wrap items-center gap-x-1 gap-y-2 sm:flex">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;

          return (
            <li key={step.id} className="flex items-center gap-1">
              <span
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                  isActive
                    ? 'bg-mist text-ink font-semibold'
                    : isComplete
                      ? 'text-ink/70'
                      : 'text-ink/45'
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isComplete
                      ? 'bg-ink text-white'
                      : isActive
                        ? 'border-ink text-ink border-2 bg-white'
                        : 'border-ink/25 text-ink/50 border bg-white'
                  }`}
                >
                  {isComplete ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                </span>
                {step.title}
              </span>

              {index < steps.length - 1 ? (
                <span className="text-ink/30 text-sm" aria-hidden>
                  &rarr;
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
