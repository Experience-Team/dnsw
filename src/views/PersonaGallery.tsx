import { useAppContext } from '../context/AppContext';
import PersonaCard from '../components/PersonaCard';
import type { Persona } from '../types';

function SiteSection({ title, personas }: { title: string; personas: Persona[] }) {
  if (personas.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold text-grey-40 uppercase tracking-widest mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map(p => (
          <PersonaCard key={p.persona_id} persona={p} />
        ))}
      </div>
    </section>
  );
}

export default function PersonaGallery() {
  const { data, siteFilter } = useAppContext();

  if (!data) return null;

  const filtered = data.personas.filter(p =>
    siteFilter === 'both' || p.site === siteFilter
  );

  const visitnswPersonas = filtered.filter(p => p.site === 'visitnsw');
  const sydneyPersonas   = filtered.filter(p => p.site === 'sydney');

  if (filtered.length === 0) {
    return (
      <div className="py-16 text-center text-grey-40">
        No personas found for the current filter.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-grey-90 mb-8">Personas</h1>
      <SiteSection title="visitnsw.com" personas={visitnswPersonas} />
      <SiteSection title="sydney.com"   personas={sydneyPersonas} />
    </div>
  );
}
