import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import Image from "next/image";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-small-label text-text-secondary">{label}</label>
      {children}
      {hint && !error && <span className="text-caption text-text-tertiary">{hint}</span>}
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`h-12 w-full rounded border bg-white px-base10 text-small-body text-text-secondary placeholder:text-text-tertiary focus:outline-none ${
        error ? "border-danger" : "border-border-light focus:border-tint-blue"
      } ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full resize-none rounded border bg-white p-base10 text-small-body text-text-secondary placeholder:text-text-tertiary focus:outline-none ${
        error ? "border-danger" : "border-border-light focus:border-tint-blue"
      } ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, className = "", children, ...props }, ref) => (
    <div className="relative w-full">
      <select
        ref={ref}
        className={`h-12 w-full appearance-none rounded border bg-white py-0 pl-base10 pr-11 text-small-body text-text-secondary focus:outline-none ${
          error ? "border-danger" : "border-border-light focus:border-tint-blue"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <Image
        src="/icons/chevron-down.png"
        alt=""
        width={16}
        height={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
      />
    </div>
  )
);
Select.displayName = "Select";
