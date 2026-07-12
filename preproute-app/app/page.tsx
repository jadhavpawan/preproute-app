"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [hasHydrated, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-small-body text-text-tertiary">Loading…</p>
    </div>
  );
}
