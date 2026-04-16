import { useAppContext } from '../context/AppContext';
import type { Segment } from '../types';

export default function AudienceSegmentsView() {
  const { data } = useAppContext();
  if (!data) return null;

  const { segments } = data;

  if (segments.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-grey-90">Audience Segments</h1>
          <p className="text-sm text-grey-50 mt-0.5">Defined audience segments and their characteristics.</p>
        </div>
        <div className="py-16 text-center text-grey-40">No segment data found.</div>
      </div>
    );
  }

  const headers = Object.keys(segments[0]);
  const titleKey = headers[0];
  const bodyKeys = headers.slice(1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-90">Audience Segments</h1>
        <p className="text-sm text-grey-50 mt-0.5">Defined audience segments and their characteristics.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg, i) => (
          <SegmentCard key={i} segment={seg} titleKey={titleKey} bodyKeys={bodyKeys} />
        ))}
      </div>
    </div>
  );
}

function SegmentCard({
  segment,
  titleKey,
  bodyKeys,
}: {
  segment: Segment;
  titleKey: string;
  bodyKeys: string[];
}) {
  return (
    <div className="bg-white border border-grey-20 rounded-xl overflow-hidden">
      <div className="h-1 bg-accent" />
      <div className="p-5">
        <p className="font-semibold text-grey-90 leading-tight mb-4">
          {segment[titleKey] || '—'}
        </p>
        <div className="space-y-2.5">
          {bodyKeys.map(key => {
            const val = segment[key];
            if (!val) return null;
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-grey-40 uppercase tracking-wide mb-0.5">
                  {key}
                </p>
                <p className="text-sm text-grey-70 leading-relaxed">{val}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
