import Image from 'next/image';

export function Logo({ className = 'h-8 w-auto' }: { className?: string }) {
  return <Image src="/logo.png" alt="Basirah" width={400} height={200} priority className={className} />;
}
