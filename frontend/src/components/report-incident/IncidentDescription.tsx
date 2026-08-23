'use client';

import type { IncidentRoute } from '@/types/incident-report';
import { EmergencyNotice } from './EmergencyNotice';
import { LongTextQuestion } from './LongTextQuestion';
import { TextQuestion } from './TextQuestion';
import type { StepBodyProps } from './step-body';

type IncidentDescriptionProps = StepBodyProps & { route: IncidentRoute };

export function IncidentDescription({ route, report, errors, set }: IncidentDescriptionProps) {
  const isOnline = route === 'online';

  return (
    <div className="space-y-5">
      {isOnline ? (
        <LongTextQuestion
          id="threats"
          label="Did the content contain threats or references to violence?"
          helper="You do not need to reproduce hateful slurs or disturbing language word-for-word."
          placeholder="Tell us whether any threats were made and what they said or referred to."
          optional
          value={report.threats}
          onChange={(value) => set('threats', value)}
        />
      ) : (
        <>
          <LongTextQuestion
            id="threats"
            label="Was anyone threatened or in immediate danger?"
            placeholder="Tell us about any threats, intimidation, or immediate safety concerns."
            optional
            value={report.threats}
            onChange={(value) => set('threats', value)}
          />

          <EmergencyNotice variant="compact" />

          <TextQuestion
            id="weapon"
            label="Was a weapon mentioned, shown, or used?"
            placeholder="If relevant, describe what you saw or heard."
            optional
            value={report.weapon}
            onChange={(value) => set('weapon', value)}
          />
        </>
      )}

      {isOnline ? (
        <LongTextQuestion
          id="responsible_description"
          label="Describe the person or account responsible, if known"
          placeholder="Provide any information you remember about the account, individual, organization, or group involved."
          optional
          value={report.responsible_description}
          onChange={(value) => set('responsible_description', value)}
        />
      ) : null}

      <LongTextQuestion
        id="description"
        label={isOnline ? 'Describe the incident' : 'What happened?'}
        helper={
          isOnline
            ? 'You do not need to repeat slurs or hateful language unless you believe the exact wording is important.'
            : 'You do not need to reproduce hateful language or slurs.'
        }
        placeholder={
          isOnline
            ? 'Tell us what happened in your own words. Include any context that you think would help someone understand the incident.'
            : 'Describe the incident in your own words. Include what happened before, during, and after if you believe it is relevant.'
        }
        size="large"
        rows={isOnline ? 6 : 8}
        value={report.description}
        error={errors.description}
        onChange={(value) => set('description', value)}
      />

      {!isOnline ? (
        <>
          <LongTextQuestion
            id="before_context"
            label="What happened immediately before the incident?"
            placeholder="Add any context that may help explain what happened."
            optional
            value={report.before_context}
            onChange={(value) => set('before_context', value)}
          />

          <LongTextQuestion
            id="after_context"
            label="What happened afterward?"
            placeholder="For example: the person left, security became involved, staff responded, police were contacted..."
            optional
            value={report.after_context}
            onChange={(value) => set('after_context', value)}
          />
        </>
      ) : null}

      <LongTextQuestion
        id="other_details"
        label="Any other relevant details?"
        placeholder={
          isOnline
            ? 'Add anything else that may be relevant.'
            : 'Tell us anything else you think could be important.'
        }
        size="large"
        optional
        value={report.other_details}
        onChange={(value) => set('other_details', value)}
      />
    </div>
  );
}
