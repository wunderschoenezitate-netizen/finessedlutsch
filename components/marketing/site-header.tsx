"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { marketingNav } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            Member sign-in
          </ButtonLink>
          <ButtonLink href="/access" size="sm">
            Request access
          </ButtonLink>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-ink-2 hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-line px-4 pb-4 pt-2 md:hidden">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2.5 text-sm text-ink-2 hover:bg-surface-3 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ButtonLink href="/dashboard" variant="secondary" onClick={() => setOpen(false)}>
              Member sign-in
            </ButtonLink>
            <ButtonLink href="/access" onClick={() => setOpen(false)}>
              Request access
            </ButtonLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
