"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token, router]);

  // Avoid flashing protected content before we know whether a token exists.
  if (!hasHydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-small-body text-text-tertiary">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
