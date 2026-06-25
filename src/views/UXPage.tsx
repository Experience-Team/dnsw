export default function UXPage() {
  return (
    <div className="min-h-screen bg-grey-10 flex flex-col">
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-10 py-16">
        <section className="mb-14">
          <h2 className="text-4xl font-bold text-grey-90 mb-3 tracking-tight">
            UX
          </h2>
          <p className="text-base text-grey-60 leading-relaxed">
            A space for prototypes and UX work in progress.
          </p>
        </section>
      </main>

      <footer className="text-center py-7 text-base text-grey-40 border-t border-grey-20">
        &copy; 2026 Tools Hub. All rights reserved.
      </footer>
    </div>
  );
}
