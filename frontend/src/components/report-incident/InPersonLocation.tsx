'use client';

import { QuestionGroupHeading } from './QuestionField';
import { TextQuestion } from './TextQuestion';
import type { StepBodyProps } from './step-body';

export function InPersonLocation({ report, errors, set }: StepBodyProps) {
  return (
    <div className="space-y-5">
      <QuestionGroupHeading
        title="Location"
        description="Whatever you can give us. A neighbourhood or intersection is enough."
      />

      <TextQuestion
        id="location_kind"
        label="Where did the incident occur?"
        placeholder="For example: mosque, university, restaurant, workplace, street, transit station..."
        value={report.location_kind}
        error={errors.location_kind}
        onChange={(value) => set('location_kind', value)}
      />

      <TextQuestion
        id="location_name"
        label="What was the name of the location?"
        placeholder="For example: University of Alberta, XYZ Mosque, business name..."
        optional
        value={report.location_name}
        onChange={(value) => set('location_name', value)}
      />

      {/* Plain text input by design. Swapping in a Maps autocomplete later only changes this field. */}
      <TextQuestion
        id="location_address"
        label="What was the address or approximate location?"
        placeholder="Enter an address, intersection, neighbourhood, city, or other location information."
        optional
        autoComplete="off"
        value={report.location_address}
        onChange={(value) => set('location_address', value)}
      />
    </div>
  );
}
