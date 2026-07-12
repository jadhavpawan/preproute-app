"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "/icons/dashboard.png", href: "/dashboard" },
  { label: "Test Creation", icon: "/icons/test-creation.png", href: "/tests/new" },
  { label: "Test Tracking", icon: "/icons/test-tracking.png", href: "/tracking" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/tests/new") return pathname.startsWith("/tests");
    return pathname.startsWith(href);
  }

  return (
    <div className="flex w-[240px] shrink-0 flex-col border-r border-border-light">
      <div className="flex h-[100px] items-center border-b border-border-light px-xl">
        <Image src="/logo.png" alt="PrepRoute" width={130} height={36} priority />
      </div>
      <nav className="flex flex-col gap-1 p-md">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-2 rounded px-base10 py-2.5 text-left text-small-body transition-colors ${
                active
                  ? "bg-surface-blue text-brand-indigo"
                  : "text-icon-gray hover:bg-surface-gray"
              }`}
            >
              <Image src={item.icon} alt="" width={20} height={20} className="shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
