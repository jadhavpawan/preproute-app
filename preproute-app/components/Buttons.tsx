import { ButtonHTMLAttributes } from "react";

type BaseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className = "", children, ...props }: BaseProps) {
  return (
    <button
      className={`h-12 w-[200px] rounded bg-brand-periwinkle text-body-emphasis text-surface-gray transition-opacity hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DestructiveButton({ className = "", children, ...props }: BaseProps) {
  return (
    <button
      className={`h-12 w-[160px] rounded bg-danger text-body-emphasis text-surface-gray transition-opacity hover:opacity-90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostChip({ className = "", children, ...props }: BaseProps) {
  return (
    <button
      className={`inline-flex h-8 items-center rounded bg-danger-bg px-base10 text-small-body text-danger transition-opacity hover:opacity-80 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ToolbarActionButton({ className = "", children, ...props }: BaseProps) {
  return (
    <button
      className={`inline-flex h-10 items-center gap-1 rounded bg-surface-gray px-base10 text-small-label text-text-secondary transition-opacity hover:opacity-80 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
