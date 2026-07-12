"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  widthClassName?: string;
}

export function Dialog({ open, onClose, title, children, widthClassName = "max-w-[560px]" }: DialogProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-xl">
      <div className={`w-full ${widthClassName} rounded border border-border-light bg-white`}>
        <div className="flex items-center justify-between border-b border-border-light px-xl py-lg">
          <h2 className="text-body-emphasis text-text-secondary">{title}</h2>
          <button onClick={onClose} className="text-icon-gray hover:text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-xl">{children}</div>
      </div>
    </div>
  );
}
