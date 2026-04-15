export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-8 h-8 border-2 border-grey-20 border-t-accent rounded-full animate-spin" />
      <p className="text-sm text-grey-50">Loading data from Google Sheet…</p>
    </div>
  );
}
