import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "destructive" | "ghost" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-periwinkle text-surface-gray hover:opacity-90",
  destructive: "bg-danger text-surface-gray hover:opacity-90",
  ghost: "bg-danger-bg text-danger hover:opacity-80",
  secondary:
    "bg-surface-gray text-text-secondary border border-border-light hover:bg-white",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded px-xl text-body-emphasis transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      >
        {loading ? "Please wait…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";
