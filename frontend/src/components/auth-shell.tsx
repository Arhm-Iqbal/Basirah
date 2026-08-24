import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-basirah-teal px-3 py-8 sm:px-8 sm:py-12 lg:px-16">
      <div aria-hidden className="auth-girih pointer-events-none absolute inset-0" />
      <div aria-hidden className="auth-girih-vignette pointer-events-none absolute inset-0" />
      <div aria-hidden className="auth-girih-shine pointer-events-none absolute inset-0" />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img src="/basirah-lanterns.png" alt="" className="auth-lantern auth-lantern-left" />
        <img src="/basirah-lanterns.png" alt="" className="auth-lantern auth-lantern-right" />
      </div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/25 bg-basirah-cream/60 p-7 shadow-[0_24px_64px_rgb(0_0_0_/_40%)] backdrop-blur-xl sm:max-w-lg sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-white/8 via-transparent to-transparent"
        />
        <div className="relative">{children}</div>
      </div>
    </main>
  );
}
