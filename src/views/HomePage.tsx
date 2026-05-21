import { useNavigate } from 'react-router-dom';

interface ToolCardProps {
  icon: string;
  title: string;
  bullets: string[];
  useFor: string;
  href: string;
}

function ToolCard({ icon, title, bullets, useFor, href }: ToolCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href.startsWith('/#/')) {
      navigate(href.slice(2));
    } else {
      window.location.href = href;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white border border-grey-20 rounded-2xl p-8 text-left relative overflow-hidden
                 transition-all hover:shadow-lg hover:-translate-y-0.5 group w-full flex flex-col"
    >
      <div
        className="rounded-xl flex items-center justify-center text-2xl mb-4 bg-blue-10"
        style={{ width: 52, height: 52 }}
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-grey-90 mb-3">{title}</h3>

      <ul className="text-base text-grey-60 leading-snug mb-4 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-blue-70" aria-hidden="true">
              <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <p className="text-base text-grey-90 mb-4 mt-auto">
        <span className="font-semibold">Use this for:</span> {useFor}
      </p>

      <span className="text-base font-semibold flex items-center gap-1 text-blue-70">
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}

const TOOLS: ToolCardProps[] = [
  {
    icon: '🧭',
    title: 'User Journey Map',
    bullets: [
      'How users think, feel, and act across the trip',
      'Trip-type overlays on a universal flow',
      'Pain points and opportunities at each touchpoint',
    ],
    useFor: 'understanding the end-to-end experience before, during, and after a trip.',
    href: '/#/journey-map/ujm',
  },
  {
    icon: '📖',
    title: 'User Story Map',
    bullets: [
      'Stages broken into activities and steps',
      'Per-step rating of how well our sites support the user',
      'Visible gaps and strengths across the journey',
    ],
    useFor: 'prioritising website features by where users are least supported.',
    href: '/#/journey-map/usm',
  },
  {
    icon: '✍️',
    title: 'Adaptive Content',
    bullets: [
      'Content rules mapped by type × audience segment',
      'Variant guidance with rationale for each cell',
      'Confidence levels flagged for every recommendation',
    ],
    useFor: 'writing or briefing content that adapts to segment and context.',
    href: '/#/journey-map/content',
  },
  {
    icon: '💬',
    title: 'Quote Bank',
    bullets: [
      'Direct quotes from user research',
      'Filter by segment, sentiment, and theme',
      'Sourced and attributed for evidence',
    ],
    useFor: 'backing a recommendation or insight with real user voice.',
    href: '/#/journey-map/quotes',
  },
  {
    icon: '🗺️',
    title: 'Sitemap',
    bullets: [
      'Site information architecture at a glance',
      'Page-level metadata and types',
      'Navigation flows between sections',
    ],
    useFor: 'reviewing structure before content changes or new pages.',
    href: '/#/journey-map/sitemap',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grey-10 flex flex-col">
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-10 py-16">
        <section className="mb-14">
          <h2 className="text-4xl font-bold text-grey-90 mb-3 tracking-tight">
            UX Research Hub
          </h2>
          <p className="text-base text-grey-60 leading-relaxed">
            A repository to help you understand our users and make better decisions.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((t) => (
            <ToolCard key={t.title} {...t} />
          ))}
        </div>
      </main>

      <footer className="text-center py-7 text-base text-grey-40 border-t border-grey-20">
        &copy; 2026 Tools Hub. All rights reserved.
      </footer>
    </div>
  );
}
