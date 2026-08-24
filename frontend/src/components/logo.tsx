// A plain img, not next/image: the mark is an SVG, which next/image refuses to optimise
// without dangerouslyAllowSVG, so routing it through the optimiser buys nothing.
export function Logo({
  className = 'h-12 w-auto',
  priority = false,
  tone = 'brand',
}: {
  className?: string;
  priority?: boolean;
  tone?: 'brand' | 'white';
}) {
  // The mark is a single rust-filled path on transparency, so flattening it to black and
  // inverting gives a clean white silhouette without shipping a second asset.
  const classes = ['w-auto object-contain', tone === 'white' && 'brightness-0 invert', className]
    .filter(Boolean)
    .join(' ');

  return (
    <img
      src="/basirah-logo.svg"
      alt="Basirah"
      width={928}
      height={380}
      fetchPriority={priority ? 'high' : undefined}
      className={classes}
    />
  );
}
