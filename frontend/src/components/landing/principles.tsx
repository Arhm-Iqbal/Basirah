import { EyeOff, FileCheck2, MessageSquareHeart, Users } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: FileCheck2,
    title: 'Simple Reporting',
    description:
      'One question at a time, in plain language. You can stop and come back to it whenever you need.',
  },
  {
    icon: EyeOff,
    title: 'Privacy-Conscious',
    description:
      'Reports ask about behaviour, not identity. There are no questions about race, ethnicity, or religion.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description:
      'Built with and for Canadian Muslim communities, alongside the organizations already doing this work.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Responsible Data Use',
    description:
      'Information is collected for documentation and support, and shared in aggregate rather than as individual profiles.',
  },
];

export function Principles() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <h2 className="max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-balance text-basirah-teal sm:text-5xl">
          Built around privacy, clarity, and community support.
        </h2>

        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-basirah-cream text-basirah-teal">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-basirah-teal">{title}</h3>
                <p className="mt-2 leading-relaxed text-basirah-teal/70">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
