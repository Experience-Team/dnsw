// Bound to the shared product record's `pricing` and `availability` blocks
// (docs/product-data-contract.md §5/§4), plus `links` for the primary
// action. Renders exactly four fields — price from, duration, operating
// days, primary action — and nothing beyond them. Every field is
// independently nullable: if none are present, the component renders
// nothing; if some are present, only those render.
//
// `suitable_for` was deliberately dropped rather than added as a fifth
// field — it exists only under `extension.attraction` in the contract, out
// of scope for a component bound to the shared record/pricing/availability.

import type { ProductRecord } from '../types/product';

interface Props {
  product: ProductRecord;
}

interface PrimaryAction {
  label: string;
  href: string;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function formatOperatingDays(days: string[]): string {
  return days.map(d => DAY_LABELS[d] ?? d).join(', ');
}

function getPrimaryAction(links: ProductRecord['links']): PrimaryAction | null {
  if (links.booking) return { label: 'Book now', href: links.booking };
  if (links.website) return { label: 'Visit website', href: links.website };
  return null;
}

export default function DecisionBlock({ product }: Props) {
  const priceFrom = product.pricing?.from ?? null;
  const durationMinutes = product.availability?.typical_duration_minutes ?? null;
  const operatingDays = product.availability?.operating_days ?? [];
  const hasOperatingDays = operatingDays.length > 0;
  const primaryAction = getPrimaryAction(product.links);

  const hasAnyField = priceFrom !== null || durationMinutes !== null || hasOperatingDays || primaryAction !== null;
  if (!hasAnyField) return null;

  return (
    <div className="bg-blue-20 rounded-xl p-5 flex flex-wrap items-center gap-6">
      {priceFrom !== null && (
        <div>
          <p className="text-base text-blue-80">From</p>
          <p className="text-lg font-semibold text-blue-90">
            ${priceFrom}
            {product.pricing?.unit ? <span className="text-base font-normal text-blue-80"> {product.pricing.unit.replace('per_', '/ ')}</span> : null}
          </p>
        </div>
      )}

      {durationMinutes !== null && (
        <div>
          <p className="text-base text-blue-80">Duration</p>
          <p className="text-lg font-semibold text-blue-90">{formatDuration(durationMinutes)}</p>
        </div>
      )}

      {hasOperatingDays && (
        <div>
          <p className="text-base text-blue-80">Open</p>
          <p className="text-lg font-semibold text-blue-90">{formatOperatingDays(operatingDays)}</p>
        </div>
      )}

      {primaryAction && (
        <a
          href={primaryAction.href}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto bg-blue-90 text-white text-base font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-80 transition-colors"
        >
          {primaryAction.label}
        </a>
      )}
    </div>
  );
}
