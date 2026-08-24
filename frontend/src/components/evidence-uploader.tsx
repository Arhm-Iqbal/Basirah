'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/button-link';
import { createClient } from '@/lib/supabase/client';
import {
  ACCEPTED_EVIDENCE_TYPES,
  MAX_FILES_PER_INCIDENT,
  MAX_FILE_BYTES,
  isAcceptedEvidence,
  isStrippableImage,
  prepareEvidenceFile,
} from '@/lib/exif';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCEPT = ACCEPTED_EVIDENCE_TYPES.join(',');

type ItemStatus = 'preparing' | 'ready' | 'uploading' | 'attached' | 'error';

type Item = {
  key: string;
  name: string;
  size: number;
  mime: string;
  file: File | null;
  preview: string | null;
  status: ItemStatus;
  progress: number;
  error: string | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function putToSignedUrl(url: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    request.setRequestHeader('Content-Type', file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error('That file could not be uploaded.'));
    };
    request.onerror = () => reject(new Error('That file could not be uploaded.'));
    request.send(file);
  });
}

function statusLabel(item: Item) {
  if (item.status === 'preparing') return 'removing location data…';
  if (item.status === 'uploading') return `uploading ${Math.round(item.progress * 100)}%`;
  if (item.status === 'attached') return 'attached';
  if (item.status === 'ready') return 'ready to attach';
  return null;
}

export function EvidenceUploader({ incidentId }: { incidentId: string }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // Every object URL handed to an <img>, so unmount can release them all. Reading items in the
  // cleanup would capture a stale render and leak whichever previews were added last.
  const urls = useRef<Set<string>>(new Set());
  useEffect(
    () => () => {
      for (const url of urls.current) URL.revokeObjectURL(url);
      urls.current.clear();
    },
    [],
  );

  const addFiles = useCallback(async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;

    const messages: string[] = [];
    const admitted: { key: string; file: File }[] = [];

    setItems((current) => {
      let capacity = MAX_FILES_PER_INCIDENT - current.length;
      const additions: Item[] = [];

      for (const file of Array.from(incoming)) {
        if (!isAcceptedEvidence(file.type)) {
          messages.push(`${file.name} was skipped — that file type isn't supported.`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          messages.push(`${file.name} was skipped — files must be 10 MB or smaller.`);
          continue;
        }
        if (capacity <= 0) {
          messages.push(`You can attach up to ${MAX_FILES_PER_INCIDENT} files.`);
          break;
        }

        capacity -= 1;
        const key = crypto.randomUUID();
        admitted.push({ key, file });
        additions.push({
          key,
          name: file.name,
          size: file.size,
          mime: file.type,
          file: null,
          preview: null,
          status: 'preparing',
          progress: 0,
          error: null,
        });
      }

      return additions.length === 0 ? current : [...current, ...additions];
    });

    setNotice(Array.from(new Set(messages)).join(' '));

    for (const { key, file } of admitted) {
      try {
        const prepared = await prepareEvidenceFile(file);

        // Built from the sanitised copy, so no object URL ever points at the original bytes.
        const preview = isStrippableImage(prepared.file.type)
          ? URL.createObjectURL(prepared.file)
          : null;
        if (preview) urls.current.add(preview);

        setItems((current) =>
          current.map((item) =>
            item.key === key
              ? { ...item, file: prepared.file, preview, size: prepared.file.size, status: 'ready' }
              : item,
          ),
        );
      } catch (err) {
        setItems((current) =>
          current.map((item) =>
            item.key === key
              ? {
                  ...item,
                  status: 'error',
                  error:
                    err instanceof Error ? err.message : "That file couldn't be prepared safely.",
                }
              : item,
          ),
        );
      }
    }
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => {
      const target = current.find((item) => item.key === key);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
        urls.current.delete(target.preview);
      }
      return current.filter((item) => item.key !== key);
    });
    setNotice('');
  }, []);

  const attach = async () => {
    const pending = items.filter((item) => item.status === 'ready' && item.file);
    if (pending.length === 0) return;

    setBusy(true);
    setNotice('');
    try {
      const { data } = await createClient().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setNotice('You are signed out. Sign in and try again.');
        return;
      }

      for (const pendingItem of pending) {
        const file = pendingItem.file;
        if (!file) continue;

        setItems((current) =>
          current.map((item) =>
            item.key === pendingItem.key
              ? { ...item, status: 'uploading', progress: 0, error: null }
              : item,
          ),
        );

        try {
          const res = await fetch(`${API_URL}/v1/media/upload-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              incident_id: incidentId,
              filename: file.name,
              mime_type: file.type,
              size_bytes: file.size,
            }),
          });

          const body = await res.json().catch(() => null);
          if (!res.ok) {
            throw new Error(
              (body as { error?: { message?: string } } | null)?.error?.message ??
                'That file could not be attached.',
            );
          }

          await putToSignedUrl((body as { upload_url: string }).upload_url, file, (fraction) =>
            setItems((current) =>
              current.map((item) =>
                item.key === pendingItem.key ? { ...item, progress: fraction } : item,
              ),
            ),
          );

          setItems((current) =>
            current.map((item) =>
              item.key === pendingItem.key
                ? { ...item, status: 'attached', progress: 1, file: null }
                : item,
            ),
          );
        } catch (err) {
          setItems((current) =>
            current.map((item) =>
              item.key === pendingItem.key
                ? {
                    ...item,
                    status: 'error',
                    error: err instanceof Error ? err.message : 'That file could not be attached.',
                  }
                : item,
            ),
          );
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const isFull = items.length >= MAX_FILES_PER_INCIDENT;
  const readyCount = items.filter((item) => item.status === 'ready').length;
  const hasDocument = items.some((item) => !isStrippableImage(item.mime));

  return (
    <section>
      <h3 className="font-display text-lg font-medium tracking-[-0.015em] text-basirah-teal">
        Add photos or documents
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-basirah-teal/60">
        Optional. Anything that helps show what happened — a photo of damage, a screenshot, a
        letter. Your report is already saved either way.
      </p>

      <p className="mt-3 rounded-xl bg-basirah-cream px-3.5 py-3 text-sm leading-relaxed text-basirah-teal/75">
        Location and device details are stripped from photos on your device, before anything is
        uploaded.
      </p>

      <div className="mt-4 rounded-2xl border border-dashed border-basirah-teal/20 p-6 text-center">
        <p className="text-sm text-basirah-teal/60">
          {isFull
            ? `You've added the maximum of ${MAX_FILES_PER_INCIDENT} files.`
            : 'JPG, PNG, WEBP, or PDF. Up to 10 MB each.'}
        </p>

        {!isFull && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </Button>
        )}

        <label htmlFor={inputId} className="sr-only">
          Photos or documents
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {hasDocument && (
        <p className="mt-3 text-xs leading-relaxed text-basirah-teal/50">
          PDFs are uploaded exactly as they are. We can&apos;t strip hidden details from a document,
          so open it first if you&apos;re unsure what it holds.
        </p>
      )}

      {notice && (
        <p role="status" className="mt-3 text-sm text-basirah-rust">
          {notice}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 rounded-xl border border-basirah-teal/12 p-2.5"
            >
              {item.preview ? (
                <img
                  src={item.preview}
                  alt=""
                  className="size-12 shrink-0 rounded-lg border border-basirah-teal/10 object-cover"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-basirah-teal/8 text-[0.625rem] font-medium tracking-wide text-basirah-teal/70 uppercase">
                  {item.mime === 'application/pdf' ? 'PDF' : 'File'}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-basirah-teal" title={item.name}>
                  {item.name}
                </span>
                <span className="block text-xs text-basirah-teal/45">
                  {formatBytes(item.size)}
                  {statusLabel(item) ? ` · ${statusLabel(item)}` : null}
                </span>

                {item.status === 'uploading' && (
                  <span
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(item.progress * 100)}
                    aria-label={`Uploading ${item.name}`}
                    className="mt-1.5 block h-0.5 w-full overflow-hidden rounded-full bg-basirah-teal/10"
                  >
                    <span
                      className="block h-full bg-basirah-teal transition-[width] duration-200"
                      style={{ width: `${Math.round(item.progress * 100)}%` }}
                    />
                  </span>
                )}

                {item.error && (
                  <span className="mt-1 block text-xs text-basirah-rust">{item.error}</span>
                )}
              </span>

              {item.status !== 'uploading' && item.status !== 'attached' && (
                <button
                  type="button"
                  onClick={() => remove(item.key)}
                  aria-label={`Remove ${item.name}`}
                  className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs text-basirah-teal/50 transition-colors hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {readyCount > 0 && (
        <Button className="mt-5" onClick={() => void attach()} disabled={busy}>
          {busy ? 'Attaching…' : `Attach ${readyCount} ${readyCount === 1 ? 'file' : 'files'}`}
        </Button>
      )}
    </section>
  );
}
