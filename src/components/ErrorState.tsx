interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="m-8 p-6 bg-red-10 border border-red-30 rounded-xl max-w-xl">
      <p className="font-semibold text-red-70 mb-1">Could not load data</p>
      <p className="text-base text-red-70 leading-relaxed mb-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-base font-semibold px-4 py-1.5 rounded-lg border border-red-30
                     text-red-70 hover:bg-red-20 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
