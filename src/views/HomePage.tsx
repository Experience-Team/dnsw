import { useNavigate } from 'react-router-dom';

interface HubCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
}

function HubCard({ icon, title, description, href }: HubCardProps) {
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
      className="bg-white border border-grey-20 rounded-2xl p-10 text-left
                 transition-all hover:shadow-lg hover:-translate-y-0.5 group w-full flex flex-col"
    >
      <div
        className="rounded-xl flex items-center justify-center text-3xl mb-5 bg-blue-10"
        style={{ width: 60, height: 60 }}
      >
        {icon}
      </div>

      <h3 className="text-xl font-semibold text-grey-90 mb-2">{title}</h3>
      <p className="text-base text-grey-60 leading-relaxed flex-1">{description}</p>

      <span className="mt-6 text-base font-semibold flex items-center gap-1 text-blue-70">
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grey-10 flex flex-col">
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-10 py-16">
        <section className="mb-14">
          <h1 className="text-4xl font-bold text-grey-90 mb-3 tracking-tight">
            DNSW Design and Research Hub
          </h1>
          <p className="text-base text-grey-60 leading-relaxed">
            A central space for design and research tools to help make better decisions.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <HubCard
            icon="🔬"
            title="Research Hub"
            description="User journey maps, story maps, quote bank, adaptive content, and sitemap — everything to understand our users."
            href="/#/journey-map/ujm"
          />
          <HubCard
            icon="🎨"
            title="UX"
            description="Prototypes and design explorations. A space for reviewing and sharing UX work in progress."
            href="https://dnsw.vercel.app/wireframes/index.html"
          />
        </div>
      </main>

      <footer className="text-center py-7 text-base text-grey-40 border-t border-grey-20">
        &copy; 2026 Tools Hub. All rights reserved.
      </footer>
    </div>
  );
}
