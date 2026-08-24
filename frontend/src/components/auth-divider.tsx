export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-basirah-teal/20" />
      <span className="text-center text-xs font-medium tracking-wide text-basirah-teal/70 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-basirah-teal/20" />
    </div>
  );
}
