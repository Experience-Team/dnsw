import { Outlet, NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const NAV_ITEMS = [
  { label: 'User Journey Map',     to: '/journey-map/ujm',       end: false },
  { label: 'Customer Journey Map', to: '/journey-map/cjm',       end: false },
  { label: 'User Story Map',       to: '/journey-map/usm',       end: false },
  { label: 'Adaptive Content',     to: '/journey-map/content',   end: false },
  { label: 'Quote Bank',           to: '/journey-map/quotes',    end: false },
  { label: 'Sitemap',              to: '/journey-map/sitemap',   end: false },
] as const;

export default function AppShell() {
  const { data, loading, error, lastRefreshed, refresh, siteFilter } =
    useAppContext();

  const refreshLabel = lastRefreshed
    ? `Last refreshed: ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : loading
    ? 'Loading…'
    : '';

  return (
    <div className="min-h-screen bg-blue-10 flex flex-col" data-theme={siteFilter === 'visitnsw' ? 'nsw' : undefined}>
      {/* ── Header ── */}
      <header className="bg-blue-90 text-white sticky top-0 z-40">
        <div className="px-10 h-14 flex items-center">
          {/* Nav tabs */}
          <div className="flex h-full items-end gap-6">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `pb-[13px] pt-[6px] border-b-[3px] text-base transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-blue-10 text-white font-bold'
                      : 'border-transparent text-blue-30 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex-1" />

          {/* Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            {refreshLabel && (
              <span className="text-base text-blue-20 hidden sm:block">{refreshLabel}</span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs font-bold px-[14px] py-[8px] rounded-[6px] border border-blue-20
                         text-blue-30 hover:text-white hover:border-white transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-[6px]"
            >
              {loading ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-spin" aria-hidden="true">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="21 7" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M10.5 4.5H7.5M10.5 4.5V1.5M10.5 4.5C9.5 2.7 7.6 1.5 5.5 1.5A4.5 4.5 0 1 0 10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>
      </header>

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
