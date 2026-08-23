import { NavBar } from '@/components/nav-bar';

export const metadata = { title: 'Resources · Basirah' };

const RESOURCES = [
  {
    title: 'In an emergency',
    body: 'If anyone is in immediate danger, call 911 first. Basirah is not an emergency service and does not dispatch a response.',
  },
  {
    title: 'Security Infrastructure Program',
    body: 'Public Safety Canada funds security improvements for communities at risk of hate-motivated incidents. Documented incident history strengthens an application.',
  },
  {
    title: 'Reporting a hate crime',
    body: 'Incidents can be reported to local police regardless of whether they are logged here. Filing with Basirah does not file with police.',
  },
  {
    title: 'Facility hardening',
    body: 'Lighting, camera placement, entry control, and sightlines are the highest-value improvements for most facilities. Assessments are coming to the app.',
  },
];

export default function ResourcesPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
          Resources
        </h1>
        <p className="mt-4 text-basirah-teal/70">
          Practical starting points for communities and mosque administrators.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {RESOURCES.map((r) => (
            <div key={r.title} className="rounded-2xl bg-white p-6">
              <h2 className="font-semibold tracking-tight text-basirah-teal">{r.title}</h2>
              <p className="mt-2 text-sm text-basirah-teal/70">{r.body}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
