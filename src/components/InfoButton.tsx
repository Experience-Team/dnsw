import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface InfoButtonProps {
  title: string;
  bullets: string[];
  useFor: string;
}

export default function InfoButton({ title, bullets, useFor }: InfoButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={`About ${title}`}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-90/30
                   text-blue-90/50 hover:border-blue-90 hover:text-blue-90 transition-colors text-sm font-bold leading-none"
      >
        ?
      </button>

      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`About ${title}`}
            className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-grey-20">
              <h2 className="text-lg font-semibold text-grey-90">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-grey-40 hover:text-grey-90 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <ul className="space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-base text-grey-60">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-blue-70" aria-hidden="true">
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-1">
                <p className="text-base text-grey-90">
                  <span className="font-semibold">Use this for:</span> {useFor}
                </p>
              </div>
            </div>
          </aside>
        </>,
        document.body,
      )}
    </>
  );
}
