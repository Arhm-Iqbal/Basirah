const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-basirah-teal/15 text-basirah-teal',
  triaged: 'bg-basirah-cyan text-basirah-teal',
  verified: 'bg-basirah-teal text-white',
  alerted: 'bg-basirah-rust text-white',
  resolved: 'border border-basirah-teal/25 bg-white text-basirah-teal',
  false_alarm: 'border border-basirah-teal/25 bg-white text-basirah-teal',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-sm font-semibold capitalize ${
        STATUS_STYLES[status] ?? 'border border-basirah-teal/25 bg-white text-basirah-teal'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
