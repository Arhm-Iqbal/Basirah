import Link from 'next/link';
import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';

const NAV_LINKS = [
  { href: '/support', label: 'Find Community Support' },
  { href: '/mosques', label: 'Mosques' },
];

export function SiteHeader() {
  return (
    <header className="border-ink/10 border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-ink text-xl font-semibold tracking-tight">Basirah</span>
          <span className="text-ink/50 hidden text-xs sm:inline">بصيرة</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:ml-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-ink/80 hover:bg-mist hover:text-ink rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <ReportIncidentTrigger />
      </div>
    </header>
  );
}
