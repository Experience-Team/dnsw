import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
// import type { SiteFilter } from '../types';

const NAV_ITEMS = [
  { label: 'Customer Journey Map', to: '/journey-map/cjm',      end: false },
  { label: 'User Story Map',       to: '/journey-map/usm',       end: false },
  { label: 'Adaptive Content',     to: '/journey-map/content',   end: false },
  { label: 'Quote Bank',           to: '/journey-map/quotes',    end: false },
] as const;

// const SITE_OPTIONS: { label: string; value: SiteFilter }[] = [
//   { label: 'Both',      value: 'both'     },
//   { label: 'visitnsw',  value: 'visitnsw' },
//   { label: 'Sydney',    value: 'sydney'   },
// ];

// function siteButtonClass(active: boolean, value: SiteFilter) {
//   if (!active) return 'text-grey-50 hover:text-grey-80 border border-transparent';
//   if (value === 'visitnsw') return 'bg-green-80 text-white border border-green-80';
//   if (value === 'sydney')   return 'bg-blue-70 text-white border border-blue-70';
//   return 'bg-grey-90 text-white border border-grey-90';
// }

export default function AppShell() {
  const { data, loading, error, lastRefreshed, refresh } =
    useAppContext();
  const navigate = useNavigate();

  const refreshLabel = lastRefreshed
    ? `Last refreshed: ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : loading
    ? 'Loading…'
    : '';

  return (
    <div className="min-h-screen bg-blue-10 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-blue-80 text-white sticky top-0 z-40">
        <div className="px-10 h-14 flex items-center gap-6">
          {/* Back to hub */}
          <button
            onClick={() => navigate('/')}
            className="text-blue-30 hover:text-white text-base transition-colors shrink-0"
            title="Back to tools hub"
          >
            ← Hub
          </button>

          <span className="text-white font-semibold text-base shrink-0">Journey Map</span>

          <div className="flex-1" />

          {/* Site filter — hidden for now */}
          {/* <div className="flex items-center gap-1 bg-grey-80 rounded-lg p-1">
            {SITE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSiteFilter(opt.value)}
                className={`
                  text-base font-medium px-3 py-1.5 rounded-md transition-all
                  ${siteButtonClass(siteFilter === opt.value, opt.value)}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div> */}

          {/* Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            {refreshLabel && (
              <span className="text-base text-blue-20 hidden sm:block">{refreshLabel}</span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs font-bold px-[13px] py-[7px] rounded-[6px] border border-blue-20
                         text-blue-30 hover:text-white hover:border-white transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-3 h-3 border border-blue-30 border-t-transparent rounded-full animate-spin inline-block" />
              ) : '↻ Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <nav className="bg-blue-10 border-b border-blue-20 sticky top-14 z-30">
        <div className="px-10 flex gap-8">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-xl px-0 pb-[19px] pt-8 border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-80 text-blue-80 font-bold'
                    : 'border-transparent text-blue-90/60 hover:text-blue-90'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 w-full px-10 py-6">
        {!data && loading && <LoadingState />}
        {!data && !loading && error && <ErrorState message={error} />}
        {data && (
          <>
            {/* Refresh error banner (data exists but refresh failed) */}
            {error && (
              <div className="mb-4 px-4 py-2.5 bg-yellow-20 border border-yellow-40 rounded-lg text-base text-yellow-80">
                ⚠ Refresh failed: {error}
              </div>
            )}
            <Outlet />
          </>
        )}
      </main>
    </div>
  );
}
