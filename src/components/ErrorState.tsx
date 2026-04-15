interface Props {
  message: string;
}

export default function ErrorState({ message }: Props) {
  return (
    <div className="m-8 p-6 bg-red-10 border border-red-30 rounded-xl max-w-xl">
      <p className="font-semibold text-red-70 mb-1">Could not load data</p>
      <p className="text-sm text-red-70 leading-relaxed">{message}</p>
    </div>
  );
}
