'use client';

import { INPUT_CLASS } from './QuestionField';
import { TextQuestion } from './TextQuestion';
import type { StepBodyProps } from './step-body';

/**
 * Date and time are the only pickers in the flow, and both stay optional. The free-text note
 * underneath is the field most people will actually use.
 */
export function WhenQuestion({ report, set }: StepBodyProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-ink text-base font-semibold sm:text-lg">
            When did the incident occur?
          </h3>
          <span className="text-ink/50 text-xs font-medium tracking-wide uppercase">Optional</span>
        </div>
        <p className="text-ink/70 mt-1.5 text-sm leading-relaxed">
          Fill in whichever you know. An approximate answer is fine.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="occurred_on" className="text-ink block text-sm font-medium">
              Date
            </label>
            <input
              id="occurred_on"
              name="occurred_on"
              type="date"
              max={today}
              value={report.occurred_on}
              onChange={(event) => set('occurred_on', event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>

          <div>
            <label htmlFor="occurred_at" className="text-ink block text-sm font-medium">
              Approximate time
            </label>
            <input
              id="occurred_at"
              name="occurred_at"
              type="time"
              value={report.occurred_at}
              onChange={(event) => set('occurred_at', event.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
        </div>
      </div>

      <TextQuestion
        id="timing_note"
        label="If you are unsure, tell us approximately when it occurred."
        placeholder="For example: Saturday evening, about two weeks ago..."
        optional
        value={report.timing_note}
        onChange={(value) => set('timing_note', value)}
      />
    </div>
  );
}
