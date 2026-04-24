import { useAppContext } from '../context/AppContext';

export default function CustomerJourneyMapView() {
  const { data } = useAppContext();
  if (!data) return null;

  const { stages } = data;

  if (stages.length === 0) {
    return (
      <div className="py-16 text-center text-blue-90/40">No journey stages found.</div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-90">Customer Journey Map</h1>
        <p className="text-sm text-blue-90/60 mt-0.5">Key phases of the customer journey, in order.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage.stage_id}
            className="flex-shrink-0 w-64 flex flex-col gap-1.5"
          >
            <div className="bg-blue-20 rounded px-2 py-2.5 text-center">
              <h2 className="font-semibold text-blue-90 text-[18px] leading-[40px]">
                {stage.stage_name}
              </h2>
            </div>
            {stage.description && (
              <p className="text-xs italic text-blue-90 leading-relaxed px-1">
                {stage.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
