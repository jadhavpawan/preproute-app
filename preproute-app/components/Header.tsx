"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Standalone top bar — no logo, since the logo lives in the sidebar on these
// screens (see Image 2/3). Used inside pages that render <AppSidebar> or
// <QuestionNavSidebar> alongside it.
export function Header({ extra }: { extra?: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const displayName = user?.name ?? user?.userId ?? "Account";

  return (
    <header className="flex h-[92px] w-full items-center justify-end gap-lg border-b border-border-light px-xl">
      {extra}
      <button aria-label="Notifications" className="flex h-12 w-12 items-center justify-center">
        <Image src="/icons/bell.png" alt="" width={48} height={48} />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5"
        >
          <Image
            src="/icons/avatar.png"
            alt=""
            width={48}
            height={48}
            className="rounded-avatar"
          />
          <div className="text-left">
            <p className="text-section-title leading-tight text-text-secondary">
              {displayName}
            </p>
            <p className="text-admin-label text-text-secondary">Admin</p>
          </div>
          <Image src="/icons/chevron-down.png" alt="" width={20} height={20} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded border border-border-light bg-white py-1 shadow-none">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-base10 py-2 text-small-body text-danger hover:bg-danger-bg"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
