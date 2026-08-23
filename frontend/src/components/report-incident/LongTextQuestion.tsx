'use client';

import type { ReactNode } from 'react';
import { INVALID_CLASS, QuestionField, TEXTAREA_CLASS, describedBy } from './QuestionField';

type Size = 'medium' | 'large';

const MIN_HEIGHTS: Record<Size, string> = {
  medium: 'min-h-[140px]',
  large: 'min-h-[220px]',
};

type LongTextQuestionProps = {
  id: string;
  label: string;
  helper?: ReactNode;
  optional?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: Size;
  rows?: number;
};

export function LongTextQuestion({
  id,
  label,
  helper,
  optional,
  error,
  value,
  onChange,
  placeholder,
  size = 'medium',
  rows = 5,
}: LongTextQuestionProps) {
  return (
    <QuestionField id={id} label={label} helper={helper} optional={optional} error={error}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(helper), Boolean(error))}
        onChange={(event) => onChange(event.target.value)}
        className={`${TEXTAREA_CLASS} ${MIN_HEIGHTS[size]} ${error ? INVALID_CLASS : ''}`}
      />
    </QuestionField>
  );
}
