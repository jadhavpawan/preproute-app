"use client";

import { create } from "zustand";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";

type ToastKind = "success" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: nextId++, kind, message }],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
};

function ToastItem({ toastItem }: { toastItem: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toastItem.id), 4000);
    return () => clearTimeout(timer);
  }, [toastItem.id, dismiss]);

  const isSuccess = toastItem.kind === "success";

  return (
    <div
      className={`flex items-center gap-2 rounded border-hairline px-base10 py-2 text-small-body shadow-none ${
        isSuccess ? "border-success bg-success-bg text-success" : "border-danger bg-danger-bg text-danger"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      {toastItem.message}
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toastItem={t} />
      ))}
    </div>
  );
}
