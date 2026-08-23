import { NavBar } from '@/components/nav-bar';

export const metadata = { title: 'About Us · Basirah' };

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
          About Basirah
        </h1>

        <div className="mt-8 space-y-6 text-basirah-teal/80">
          <p>
            Basirah is community security infrastructure for Canadian mosques. It brings incident
            reporting, verified alerts, and facility assessments into one place, modelled on what
            comparable organisations already provide to other faith communities.
          </p>
          <p>
            Reports are collected to help communities understand what is happening around them and
            to support funding applications under the Security Infrastructure Program. Incident
            categories follow Statistics Canada hate-crime classifications so the picture can be
            compared against the national baseline.
          </p>

          <h2 className="pt-4 text-xl font-semibold tracking-tight text-basirah-teal">
            How we handle reports
          </h2>
          <p>
            Suspicious-activity reporting has a documented history of being turned against Muslim
            communities. These constraints are part of the product, not a disclaimer:
          </p>
          <ul className="list-disc space-y-2 ps-5">
            <li>
              Report forms ask what a person <em>did</em>. There are no fields for race, ethnicity,
              religion, or clothing anywhere in the system.
            </li>
            <li>
              No unverified report becomes a community-wide alert, which protects against both
              panic and the use of this system to target individuals.
            </li>
            <li>
              Anonymous reports carry no account, and the record has no field for identity or IP
              address — the guarantee is built into the database, not promised in a policy.
            </li>
            <li>Data is collected to the minimum needed, under PIPEDA and Quebec Law 25.</li>
          </ul>
        </div>
      </main>
    </>
  );
}
