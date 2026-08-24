import type { IncidentActionPlan } from '@basirah/shared';

const URGENCY = {
  routine: {
    label: 'Practical follow-up',
    className: 'border-basirah-teal/20 bg-white text-basirah-teal',
  },
  elevated: {
    label: 'Safety follow-up recommended',
    className: 'border-basirah-rust/30 bg-basirah-rust/5 text-basirah-rust',
  },
  urgent: {
    label: 'Immediate safety concern',
    className: 'border-basirah-rust bg-basirah-rust text-white',
  },
} as const;

export function ActionPlanView({ plan }: { plan: IncidentActionPlan }) {
  const urgency = URGENCY[plan.urgency];

  return (
    <section aria-labelledby="action-plan-heading">
      <span
        className={`inline-flex rounded-md border px-2.5 py-1 text-sm font-semibold ${urgency.className}`}
      >
        {urgency.label}
      </span>
      <h2
        id="action-plan-heading"
        className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em] text-basirah-teal"
      >
        {plan.heading}
      </h2>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-basirah-teal/80">{plan.summary}</p>

      <ol className="mt-6 space-y-3">
        {plan.steps.map((step, index) => (
          <li
            key={`${index}-${step.title}`}
            className="rounded-lg border border-basirah-teal/20 bg-white p-4 sm:p-5"
          >
            <div className="flex gap-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-basirah-teal text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-base leading-relaxed text-basirah-teal/80">
                  {step.detail}
                </p>
                {step.link && (
                  <a
                    href={step.link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex min-h-10 items-center rounded-md bg-basirah-teal px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0a4749] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
                  >
                    {step.link.label}
                    <span aria-hidden className="ms-2">
                      ↗
                    </span>
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm leading-relaxed text-basirah-teal/70">{plan.note}</p>
    </section>
  );
}
