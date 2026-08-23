'use client';

import { LongTextQuestion } from './LongTextQuestion';
import { TextQuestion } from './TextQuestion';
import { WhenQuestion } from './WhenQuestion';
import type { StepBodyProps } from './step-body';

export function InPersonPeopleTiming({ report, errors, set }: StepBodyProps) {
  return (
    <div className="space-y-5">
      <TextQuestion
        id="target"
        label="Who was targeted?"
        helper="Tell us who or what was targeted."
        placeholder="Tell us who or what was targeted."
        value={report.target}
        onChange={(value) => set('target', value)}
      />

      <LongTextQuestion
        id="responsible_party"
        label="Who carried out the incident?"
        helper="You can leave this blank if you do not know."
        placeholder="Describe the person, people, group, organization, or business involved if you know."
        optional
        value={report.responsible_party}
        onChange={(value) => set('responsible_party', value)}
      />

      <LongTextQuestion
        id="responsible_description"
        label="Describe the person or people involved"
        helper="Only what you personally saw or know. You are not expected to guess at anything about them."
        placeholder="Include any details you remember that may help identify or understand who was involved."
        optional
        value={report.responsible_description}
        onChange={(value) => set('responsible_description', value)}
      />

      <WhenQuestion report={report} errors={errors} set={set} />

      <TextQuestion
        id="duration"
        label="How long did the incident last?"
        placeholder="For example: a few minutes, approximately 30 minutes, ongoing..."
        optional
        value={report.duration}
        onChange={(value) => set('duration', value)}
      />

      <TextQuestion
        id="witnesses"
        label="Were there witnesses?"
        placeholder="For example: Yes — several people nearby. No known witnesses. Unsure."
        optional
        value={report.witnesses}
        onChange={(value) => set('witnesses', value)}
      />

      <LongTextQuestion
        id="witness_details"
        label="Tell us about any witnesses"
        helper="Please do not share anyone else's private contact information without their agreement."
        placeholder="If there were witnesses, describe anything relevant that you remember."
        optional
        value={report.witness_details}
        onChange={(value) => set('witness_details', value)}
      />
    </div>
  );
}
