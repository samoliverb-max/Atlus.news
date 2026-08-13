import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <header
      className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10"
      style={{ color: dark ? "var(--color-platinum)" : "var(--color-royal)" }}
    >
      <Link to="/" className="flex items-center gap-2">
        <span
          className="text-2xl leading-none"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
        >
          Atl
          <span style={{ fontFamily: "var(--font-hand)", color: "var(--color-amber)" }}>u</span>
          s
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm" style={{ fontFamily: "var(--font-serif)" }}>
        <Link to="/manifesto" className="opacity-80 hover:opacity-100">Manifesto</Link>
        <Link to="/team" className="opacity-80 hover:opacity-100">Team</Link>
        <a
          href="/#waitlist"
          className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide"
          style={{ background: "var(--color-amber)", color: "var(--color-royal)" }}
        >
          Join
        </a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="relative px-6 py-14 sm:px-10"
      style={{ background: "var(--color-royal)", color: "var(--color-platinum)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row">
        <div>
          <div className="text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
            Atl
            <span style={{ fontFamily: "var(--font-hand)", color: "var(--color-amber)" }}>u</span>
            s
          </div>
          <p className="mt-3 max-w-sm text-sm opacity-70" style={{ fontFamily: "var(--font-serif)" }}>
            Daily news, personalised for you. A small, deliberate paper — chosen with you in mind, never sold about you.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm" style={{ fontFamily: "var(--font-serif)" }}>
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest opacity-60">Read</p>
            <ul className="space-y-2 opacity-90">
              <li><Link to="/manifesto">Manifesto</Link></li>
              <li><Link to="/team">Team</Link></li>
              <li><a href="/#how">How it works</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest opacity-60">Contact</p>
            <ul className="space-y-2 opacity-90">
              <li>joinatlus.com</li>
              <li>hello@joinatlus.com</li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl text-xs opacity-50" style={{ fontFamily: "var(--font-serif)" }}>
        © {new Date().getFullYear()} Atlus. Your data is private to you alone.
      </p>
    </footer>
  );
}

export function Page({ children, headerVariant = "light" }: { children: ReactNode; headerVariant?: "light" | "dark" }) {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--color-platinum)", color: "var(--color-royal)" }}>
      <SiteHeader variant={headerVariant} />
      {children}
      <SiteFooter />
    </div>
  );
}
