import Image from 'next/image';

export function TealFlowerBackdrop({ priority = false }: { priority?: boolean }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/basirah-flower.png"
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="scale-[1.15] object-cover object-center opacity-35 mix-blend-screen"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-basirah-teal/45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,_transparent_0%,_rgb(4_51_52_/_55%)_100%)]" />
    </>
  );
}
