'use client';

import { useId, useRef, useState } from 'react';
import { FileText, TriangleAlert, Upload, X } from 'lucide-react';
import type { EvidenceItem } from '@/types/incident-report';

const MAX_FILES = 5;
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
] as const;
const ACCEPT_ATTRIBUTE =
  '.jpg,.jpeg,.png,.webp,.pdf,.mp4,image/jpeg,image/png,image/webp,application/pdf,video/mp4';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAccepted(file: File): boolean {
  return (ACCEPTED_TYPES as readonly string[]).includes(file.type);
}

export function EvidenceUploader({
  heading,
  description,
  items,
  onChange,
}: {
  heading: string;
  description: string;
  items: EvidenceItem[];
  onChange: (items: EvidenceItem[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;

    const candidates = Array.from(incoming);
    const accepted = candidates.filter(isAccepted);
    const remainingSlots = MAX_FILES - items.length;
    const admitted = accepted.slice(0, Math.max(remainingSlots, 0));

    const messages: string[] = [];
    if (accepted.length < candidates.length) {
      messages.push('Some files were skipped because that file type is not supported.');
    }
    if (admitted.length < accepted.length) {
      messages.push(`You can attach up to ${MAX_FILES} files.`);
    }
    setNotice(messages.join(' '));

    if (admitted.length === 0) return;

    onChange([
      ...items,
      ...admitted.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      })),
    ]);
  };

  const removeItem = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(items.filter((item) => item.id !== id));
    setNotice('');
  };

  const isFull = items.length >= MAX_FILES;

  return (
    <div className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-ink text-base font-semibold sm:text-lg">{heading}</h3>
        <span className="text-ink/50 text-xs font-medium tracking-wide uppercase">Optional</span>
      </div>
      <p className="text-ink/70 mt-1.5 text-sm leading-relaxed">{description}</p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDraggingOver(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`mt-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDraggingOver ? 'border-ink bg-mist' : 'border-ink/20 bg-cream/40'
        }`}
      >
        <Upload className="text-ink/60 mx-auto size-6" aria-hidden />
        <p className="text-ink/70 mt-2 text-sm">
          {isFull ? `You have added the maximum of ${MAX_FILES} files.` : 'Drag files here, or'}
        </p>

        {!isFull ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border-ink/25 text-ink hover:bg-mist mt-2.5 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Choose files
          </button>
        ) : null}

        <label htmlFor={inputId} className="sr-only">
          {heading}
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <p className="text-ink/55 mt-3 text-xs">
          JPG, PNG, WEBP, PDF, or MP4. Up to {MAX_FILES} files.
        </p>
      </div>

      {notice ? (
        <p role="status" className="text-rust mt-3 flex items-start gap-1.5 text-sm font-medium">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {notice}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-ink/12 flex items-center gap-3 rounded-xl border bg-white p-2.5"
            >
              {item.previewUrl ? (
                // Object URLs are local to this session, so next/image cannot optimise them.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt=""
                  className="border-ink/10 size-12 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <span className="bg-mist text-ink flex size-12 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="size-5" aria-hidden />
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="text-ink block truncate text-sm font-medium">
                  {item.file.name}
                </span>
                <span className="text-ink/55 block text-xs">{formatBytes(item.file.size)}</span>
              </span>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="text-ink/60 hover:bg-mist hover:text-ink shrink-0 rounded-lg p-2 transition-colors"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
