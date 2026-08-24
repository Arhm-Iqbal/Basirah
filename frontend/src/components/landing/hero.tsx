import { Logo } from '@/components/logo';
import { Reveal } from '@/components/reveal';
import { TealFlowerBackdrop } from '@/components/teal-flower-backdrop';

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4.5rem)] items-center justify-center overflow-hidden bg-basirah-teal">
      <TealFlowerBackdrop priority />

      <Reveal className="relative z-10 w-full">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16">
          <Logo
            priority
            className="h-40 w-auto sm:h-56 md:h-72 [filter:drop-shadow(0_1px_0_rgb(0_0_0_/_40%))_drop-shadow(0_6px_8px_rgb(0_0_0_/_32%))_drop-shadow(0_16px_24px_rgb(0_0_0_/_22%))]"
          />
          <h1 className="mt-6 max-w-3xl text-3xl leading-[1.12] text-basirah-cream sm:mt-8 sm:text-5xl md:text-6xl">
            Report. Connect. Protect.
          </h1>
        </div>
      </Reveal>
    </section>
  );
}
