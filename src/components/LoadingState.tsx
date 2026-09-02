export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-8 h-8 border-2 border-grey-20 border-t-accent rounded-full animate-spin" />
      <p className="text-base text-grey-50 text-center max-w-sm">
        Loading data, this can take up to 15 seconds if the tool hasn't been used recently, or you can try a hard refresh
      </p>
    </div>
  );
}
