import { Calendar, Check, Globe, ImagePlus, MapPin, User } from 'lucide-react';

import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';

const FIELDS = [
  { icon: MapPin, label: 'Where did it happen?', hint: 'Outside the masjid on Whyte Avenue' },
  { icon: User, label: 'Who was targeted?', hint: 'Me and two people leaving prayer' },
  { icon: Calendar, label: 'When did it happen?', hint: 'Friday evening, around 8:30 PM' },
  { icon: ImagePlus, label: 'Add screenshots or evidence', hint: 'Optional' },
];

export function Reporting() {
  return (
    <section className="bg-basirah-teal">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-32">
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-white sm:text-5xl">
              When something happens, knowing what to do shouldn&rsquo;t be the hardest part.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-basirah-cream/80">
              Basirah walks you through one question at a time. You choose where the incident
              happened, and the form adapts to your answer.
            </p>
            <p className="mt-8 text-xl font-semibold text-basirah-cyan">
              One question. One box. Tell your story.
            </p>
            <div className="mt-10">
              <ReportIncidentTrigger size="large" label="Start a report" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 sm:p-8">
              <p className="text-lg font-semibold tracking-tight text-basirah-teal sm:text-xl">
                Where did the incident occur?
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-basirah-teal bg-basirah-cyan p-5">
                  <div className="flex items-start justify-between">
                    <Globe className="size-6 text-basirah-teal" aria-hidden />
                    <span className="flex size-6 items-center justify-center rounded-full bg-basirah-teal text-white">
                      <Check className="size-4" strokeWidth={3} aria-hidden />
                    </span>
                  </div>
                  <p className="mt-4 font-semibold text-basirah-teal">Online</p>
                  <p className="mt-1 text-sm leading-relaxed text-basirah-teal/70">
                    Social media, messaging, email, or another digital space.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-basirah-teal/15 p-5">
                  <MapPin className="size-6 text-basirah-teal" aria-hidden />
                  <p className="mt-4 font-semibold text-basirah-teal">In Person</p>
                  <p className="mt-1 text-sm leading-relaxed text-basirah-teal/70">
                    A mosque, school, workplace, street, or public space.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 sm:p-8">
              <p className="text-lg font-semibold tracking-tight text-basirah-teal sm:text-xl">
                What happened?
              </p>
              <div className="mt-4 rounded-2xl border border-basirah-teal/15 bg-basirah-cream/40 p-5">
                <p className="leading-relaxed text-basirah-teal/80">
                  Write as much or as little as you want. No character limits, no checkboxes to
                  decode.
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {FIELDS.map(({ icon: Icon, label, hint }) => (
                  <li
                    key={label}
                    className="flex items-center gap-4 rounded-2xl bg-basirah-cream/50 px-5 py-4"
                  >
                    <Icon className="size-5 shrink-0 text-basirah-rust" aria-hidden />
                    <span className="flex-1 text-sm font-semibold text-basirah-teal">{label}</span>
                    <span className="hidden text-sm text-basirah-teal/70 sm:block">{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
