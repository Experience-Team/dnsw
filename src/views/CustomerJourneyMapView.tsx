import { useAppContext } from '../context/AppContext';

export default function CustomerJourneyMapView() {
  const { data } = useAppContext();
  if (!data) return null;

  const { stages } = data;

  if (stages.length === 0) {
    return (
      <div className="py-16 text-center text-grey-40">No journey stages found.</div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-90">Customer Journey Map</h1>
        <p className="text-sm text-grey-50 mt-0.5">Key phases of the customer journey, in order.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <div
            key={stage.stage_id}
            className="flex-shrink-0 w-64 bg-white border border-grey-20 rounded-xl p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-full bg-grey-90 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <h2 className="font-semibold text-grey-90 text-sm leading-snug">
                {stage.stage_name}
              </h2>
            </div>
            {stage.description && (
              <p className="text-sm text-grey-60 leading-relaxed">{stage.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
