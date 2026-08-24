import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-basirah-teal">
        <div className="auth-girih absolute inset-0" />
        <div className="auth-girih-vignette absolute inset-0" />
        <div className="auth-girih-shine absolute inset-0" />
        <img src="/basirah-lanterns.png" alt="" className="auth-lantern auth-lantern-left" />
        <img src="/basirah-lanterns.png" alt="" className="auth-lantern auth-lantern-right" />
      </div>

      <main className="relative flex min-h-[100dvh] items-center justify-center px-3 py-10 sm:px-8 sm:py-14 lg:px-16">
        <div className="relative z-10 w-full max-w-md rounded-lg border border-white/30 bg-basirah-cream/80 p-6 shadow-[0_24px_64px_rgb(0_0_0_/_40%)] backdrop-blur-xl sm:max-w-lg sm:p-8">
          {children}
        </div>
      </main>
    </>
  );
}
