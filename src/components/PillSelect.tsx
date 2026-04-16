interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}

export default function PillSelect({ label, value, onChange, options }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {label && <span className="text-sm text-grey-50 shrink-0">{label}</span>}
      <div className="flex items-center gap-1 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              text-xs font-medium px-3 py-1.5 rounded-full border transition-all
              ${value === opt.value
                ? 'bg-grey-90 border-grey-90 text-white'
                : 'bg-white border-grey-20 text-grey-60 hover:border-grey-50 hover:text-grey-80'
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
