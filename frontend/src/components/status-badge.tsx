const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-basirah-teal/10 text-basirah-teal',
  triaged: 'bg-basirah-cyan text-basirah-teal',
  verified: 'bg-basirah-teal text-white',
  alerted: 'bg-basirah-rust text-white',
  resolved: 'bg-basirah-teal/5 text-basirah-teal/60',
  false_alarm: 'bg-basirah-teal/5 text-basirah-teal/50',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[status] ?? 'bg-basirah-teal/5 text-basirah-teal/60'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
