"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled,
  error,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const selectedOptions = options.filter((o) => value.includes(o.id));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded border bg-white px-base10 py-2 text-left text-small-body disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-danger" : "border-border-light"
        }`}
      >
        {selectedOptions.length === 0 && (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
        {selectedOptions.map((o) => (
          <span
            key={o.id}
            className="inline-flex items-center gap-1 rounded bg-surface-blue px-2 py-0.5 text-caption-medium text-brand-blue"
          >
            {o.name}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggle(o.id);
              }}
            />
          </span>
        ))}
        <Image src="/icons/chevron-down.png" alt="" width={16} height={16} className="ml-auto shrink-0" />
      </button>

      {open && !disabled && (
        <div className="thin-scrollbar absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded border border-border-light bg-white p-1 shadow-none">
          {options.length === 0 && (
            <p className="px-base10 py-2 text-small-body text-text-tertiary">
              No options available
            </p>
          )}
          {options.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2 rounded px-base10 py-2 text-small-body text-text-secondary hover:bg-surface-gray"
            >
              <input
                type="checkbox"
                checked={value.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="h-4 w-4 accent-brand-periwinkle"
              />
              {o.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
