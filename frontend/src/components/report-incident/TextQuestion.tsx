'use client';

import type { ReactNode } from 'react';
import { INPUT_CLASS, INVALID_CLASS, QuestionField, describedBy } from './QuestionField';

type TextQuestionProps = {
  id: string;
  label: string;
  helper?: ReactNode;
  optional?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'time';
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url';
};

export function TextQuestion({
  id,
  label,
  helper,
  optional,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
}: TextQuestionProps) {
  return (
    <QuestionField id={id} label={label} helper={helper} optional={optional} error={error}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, Boolean(helper), Boolean(error))}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} ${error ? INVALID_CLASS : ''}`}
      />
    </QuestionField>
  );
}
