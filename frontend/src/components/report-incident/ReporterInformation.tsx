'use client';

import { LongTextQuestion } from './LongTextQuestion';
import { QuestionGroupHeading } from './QuestionField';
import { TextQuestion } from './TextQuestion';
import type { StepBodyProps } from './step-body';

export function ReporterInformation({ report, set }: StepBodyProps) {
  return (
    <div className="space-y-5">
      <QuestionGroupHeading
        title="About You"
        description="You can provide as much or as little contact information as you are comfortable sharing."
      />

      <TextQuestion
        id="reporter_name"
        label="What is your name?"
        placeholder="Your name"
        autoComplete="name"
        optional
        value={report.reporter_name}
        onChange={(value) => set('reporter_name', value)}
      />

      <TextQuestion
        id="reporter_email"
        label="How can we contact you?"
        placeholder="you@example.com"
        type="email"
        inputMode="email"
        autoComplete="email"
        optional
        value={report.reporter_email}
        onChange={(value) => set('reporter_email', value)}
      />

      <TextQuestion
        id="reporter_phone"
        label="Phone number"
        placeholder="Your phone number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        optional
        value={report.reporter_phone}
        onChange={(value) => set('reporter_phone', value)}
      />

      <div className="border-ink/15 bg-mist rounded-2xl border p-5">
        <h3 className="text-ink text-base font-semibold">
          Would you prefer not to identify yourself?
        </h3>
        <p className="text-ink/80 mt-1.5 text-sm leading-relaxed">
          You can leave your name, email, and phone number blank if you prefer to submit the report
          without identifying yourself. Keep in mind that anything you write in the report itself
          may still describe you.
        </p>
      </div>

      <TextQuestion
        id="reporting_for"
        label="Are you reporting this for yourself or someone else?"
        placeholder="For example: myself, a family member, a friend, my mosque, an organization..."
        optional
        value={report.reporting_for}
        onChange={(value) => set('reporting_for', value)}
      />

      <QuestionGroupHeading title="Reporting elsewhere" />

      <LongTextQuestion
        id="reported_elsewhere"
        label="Has this incident already been reported anywhere else?"
        placeholder="For example: police, university, school, employer, social media platform, mosque leadership, human rights organization..."
        optional
        value={report.reported_elsewhere}
        onChange={(value) => set('reported_elsewhere', value)}
      />

      <TextQuestion
        id="existing_reference"
        label="If applicable, provide any report or reference number"
        placeholder="Report or reference number"
        optional
        value={report.existing_reference}
        onChange={(value) => set('existing_reference', value)}
      />
    </div>
  );
}
