import Link from "next/link";
import { Fragment } from "react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <span className="text-body text-brand-indigo/60">/</span>}
          {item.href ? (
            <Link href={item.href} className="text-body text-brand-indigo/70 hover:text-brand-indigo hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-body-emphasis text-brand-indigo">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
