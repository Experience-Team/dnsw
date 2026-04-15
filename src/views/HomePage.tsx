import { useNavigate } from 'react-router-dom';

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  variant: 'sydney' | 'nsw';
}

function ToolCard({ icon, title, description, href, variant }: ToolCardProps) {
  const navigate = useNavigate();
  const isSydney = variant === 'sydney';

  const handleClick = () => {
    if (href.startsWith('/#/')) {
      navigate(href.slice(2)); // strip '#'
    } else {
      window.location.href = href;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white border border-grey-20 rounded-2xl p-8 text-left relative overflow-hidden
                 transition-all hover:shadow-lg hover:-translate-y-0.5 group w-full"
    >
      {/* Colour-coded top strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isSydney ? 'bg-blue-70' : 'bg-green-80'
        }`}
      />

      {/* Icon */}
      <div
        className={`w-13 h-13 rounded-xl flex items-center justify-center text-2xl mb-4 ${
          isSydney ? 'bg-blue-10' : 'bg-green-10'
        }`}
        style={{ width: 52, height: 52 }}
      >
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-grey-90 mb-2">{title}</h3>
      <p className="text-sm text-grey-60 leading-relaxed mb-4">{description}</p>

      <span
        className={`text-sm font-semibold flex items-center gap-1 ${
          isSydney ? 'text-blue-70' : 'text-green-70'
        }`}
      >
        Open tool
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grey-10 flex flex-col">
      {/* Header */}
      <header className="bg-green-80 px-10 h-14 flex items-center">
        <h1 className="text-white font-semibold text-lg">Tools</h1>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-screen-md mx-auto w-full px-10 py-16">
        <section className="mb-14">
          <h2 className="text-4xl font-bold text-grey-90 mb-3 tracking-tight">
            Welcome to the tools hub
          </h2>
          <p className="text-base text-grey-60 leading-relaxed max-w-lg">
            A collection of research and design tools to help you understand your users
            and improve their experiences.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ToolCard
            icon="🗺️"
            title="Customer Journey Map"
            description="Visualise the end-to-end experience of your customers, identify pain points, and uncover opportunities to improve every touchpoint."
            href="/#/journey-map"
            variant="sydney"
          />
          <ToolCard
            icon="👤"
            title="Personas"
            description="Build rich, research-backed personas to align your team around a shared understanding of who your users are and what they need."
            href="/#/journey-map/personas"
            variant="nsw"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-7 text-xs text-grey-40 border-t border-grey-20">
        &copy; 2026 Tools Hub. All rights reserved.
      </footer>
    </div>
  );
}
