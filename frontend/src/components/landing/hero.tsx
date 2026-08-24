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
            className="h-52 w-auto sm:h-72 md:h-96 [filter:drop-shadow(1px_0_0_rgb(236_232_217_/_80%))_drop-shadow(-1px_0_0_rgb(236_232_217_/_80%))_drop-shadow(0_1px_0_rgb(236_232_217_/_80%))_drop-shadow(0_-1px_0_rgb(236_232_217_/_80%))_drop-shadow(0_0_16px_rgb(236_232_217_/_55%))_drop-shadow(0_10px_18px_rgb(0_0_0_/_58%))_drop-shadow(0_28px_48px_rgb(0_0_0_/_42%))]"
          />
          <h1 className="mt-6 max-w-3xl text-3xl leading-[1.12] text-basirah-cream sm:mt-8 sm:text-5xl md:text-6xl">
            Report. Connect. Protect.
          </h1>
        </div>
      </Reveal>
    </section>
  );
}
