import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

const MOSQUES = [
  {
    name: 'Al-Noor Islamic Centre',
    location: 'Downtown, 1.2 km away',
    event: 'Neighbourhood safety workshop, Saturday 6:00 PM',
    services: ['Daily prayers', 'Funeral services', 'Marriage services'],
    programs: ['Youth halaqa', 'Newcomer support'],
  },
  {
    name: 'Masjid Al-Rahma',
    location: 'Southside, 3.4 km away',
    event: 'Community iftar planning meeting, Sunday 1:00 PM',
    services: ['Daily prayers', 'Food bank', 'Counselling referrals'],
    programs: ['Weekend school', "Sisters' circle"],
  },
  {
    name: 'Bilal Community Mosque',
    location: 'West End, 5.8 km away',
    event: 'Know your rights session, Thursday 7:30 PM',
    services: ['Daily prayers', 'Library', 'Wheelchair access'],
    programs: ['Seniors program', 'Tutoring'],
  },
];

export function Community() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-basirah-teal sm:text-5xl">
            Your community, connected.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-basirah-teal/70">
            Safety is not only about incidents. Find the mosques around you, what they offer, and
            what is happening this week.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <MapPreview />

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {MOSQUES.map((mosque) => (
              <li key={mosque.name} className="rounded-3xl bg-basirah-cream p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-basirah-teal">{mosque.name}</h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-basirah-teal/70">
                  <MapPin className="size-4" aria-hidden />
                  {mosque.location}
                </p>
                <p className="mt-4 flex items-start gap-1.5 text-sm font-medium text-basirah-rust">
                  <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {mosque.event}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[...mosque.services, ...mosque.programs].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-basirah-teal/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-basirah-teal/70">
            Sample listings shown for illustration only.
          </p>
          <Link
            href="/mosques"
            className="inline-flex items-center gap-2 text-base font-semibold text-basirah-rust hover:underline"
          >
            Explore mosques near you
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MapPreview() {
  return (
    <figure className="flex flex-col overflow-hidden rounded-3xl bg-basirah-cyan">
      <svg
        viewBox="0 0 400 400"
        className="h-full min-h-64 w-full"
        role="presentation"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#043334" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round">
          <path d="M-20 120 H420" />
          <path d="M-20 280 H420" />
          <path d="M110 -20 V420" />
          <path d="M290 -20 V420" />
        </g>
        <g stroke="#043334" strokeOpacity="0.08" strokeWidth="4">
          <path d="M-20 200 H420" />
          <path d="M200 -20 V420" />
        </g>
        <g fill="#ECE8D9" fillOpacity="0.55">
          <rect x="130" y="140" width="50" height="40" rx="6" />
          <rect x="220" y="220" width="55" height="45" rx="6" />
          <rect x="20" y="300" width="70" height="40" rx="6" />
        </g>
        <g fill="#942106">
          <circle cx="150" cy="160" r="11" />
          <circle cx="248" cy="243" r="11" />
          <circle cx="55" cy="320" r="11" />
        </g>
        <g fill="#D0FAFB">
          <circle cx="150" cy="160" r="4" />
          <circle cx="248" cy="243" r="4" />
          <circle cx="55" cy="320" r="4" />
        </g>
      </svg>
      <figcaption className="bg-white/60 px-6 py-4 text-sm font-medium text-basirah-teal/70">
        Three mosques within 6 km of your location.
      </figcaption>
    </figure>
  );
}
