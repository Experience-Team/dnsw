interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}

export default function PillSelect({ label, value, onChange, options }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {label && <span className="text-sm text-blue-90/60 shrink-0">{label}</span>}
      <div className="flex items-center gap-1 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              text-xs font-medium px-4 py-2.5 rounded-full border transition-all
              ${value === opt.value
                ? 'bg-blue-30 border-blue-30 text-blue-90'
                : 'bg-white border-blue-20 text-blue-90/60 hover:border-blue-40 hover:text-blue-90'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
