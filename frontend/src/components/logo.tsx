import Image from 'next/image';

export function Logo({
  className = 'h-12 w-auto',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/basirah-logo.png"
      alt="Basirah"
      width={928}
      height={380}
      priority={priority}
      className={`w-auto object-contain ${className}`}
    />
  );
}
