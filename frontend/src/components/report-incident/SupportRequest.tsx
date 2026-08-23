'use client';

import { LongTextQuestion } from './LongTextQuestion';
import { QuestionGroupHeading } from './QuestionField';
import type { StepBodyProps } from './step-body';

export function SupportRequest({ report, set }: StepBodyProps) {
  return (
    <div className="space-y-5">
      <QuestionGroupHeading title="Follow-up and support" />

      <LongTextQuestion
        id="support_needed"
        label="Is there any help you would like after submitting this report?"
        helper="Describe it in your own words. There is no list to pick from."
        placeholder="For example: legal support, community safety support, counselling resources, victim support, help dealing with a school or employer, or simply documenting the incident."
        size="large"
        optional
        value={report.support_needed}
        onChange={(value) => set('support_needed', value)}
      />

      <LongTextQuestion
        id="anything_else"
        label="Is there anything else you would like us to know?"
        placeholder="Anything at all."
        size="large"
        optional
        value={report.anything_else}
        onChange={(value) => set('anything_else', value)}
      />
    </div>
  );
}
