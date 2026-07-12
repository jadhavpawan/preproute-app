interface SegmentedTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <div className="flex items-center gap-xl border-b border-border-light">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative pb-2.5 text-small-body transition-colors ${
              active ? "text-brand-periwinkle" : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {opt.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-periwinkle" />
            )}
          </button>
        );
      })}
    </div>
  );
}
