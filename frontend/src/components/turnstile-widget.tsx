'use client';

import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: 'light';
      size: 'flexible';
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
      'timeout-callback': () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    const script = existing ?? document.createElement('script');
    const loaded = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile loaded without its browser API.'));
    };
    const failed = () => reject(new Error('Turnstile could not be loaded.'));

    script.addEventListener('load', loaded, { once: true });
    script.addEventListener('error', failed, { once: true });

    if (!existing) {
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export function TurnstileWidget({
  siteKey,
  onVerify,
  onError,
}: {
  siteKey: string;
  onVerify: (token: string | null) => void;
  onError: (message: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    void loadTurnstile()
      .then((turnstile) => {
        if (!active || !containerRef.current) return;

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: 'anonymous_report',
          theme: 'light',
          size: 'flexible',
          callback: (token) => {
            onError(null);
            onVerify(token);
          },
          'error-callback': () => {
            onVerify(null);
            onError('The security check could not finish. Check your connection and try again.');
          },
          'expired-callback': () => {
            onVerify(null);
            onError('The security check expired. Complete it again before submitting.');
            if (widgetIdRef.current) turnstile.reset(widgetIdRef.current);
          },
          'timeout-callback': () => {
            onVerify(null);
            onError('The security check timed out. Complete it again before submitting.');
            if (widgetIdRef.current) turnstile.reset(widgetIdRef.current);
          },
        });
      })
      .catch(() => {
        if (!active) return;
        onVerify(null);
        onError('The security check could not load. Check your connection and try again.');
      });

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onError, onVerify, siteKey]);

  return <div ref={containerRef} className="mt-3 min-h-16 w-full" />;
}
