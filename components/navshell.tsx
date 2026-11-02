"use client";
//copied content
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/lost", label: "Report Lost" },
  { href: "/found", label: "Report Found" },
];

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white";

export function NavShell({
  children,
  links = baseLinks,
}: {
  children: ReactNode;
  links?: typeof baseLinks;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 text-white backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-white"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">L</span>
            <span className="text-base font-semibold tracking-tight">Lost &amp; Found</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              {children}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isOpen && (
          <div className="mt-3 flex flex-col gap-3 border-t border-zinc-800 pt-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:hidden">
              {children}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
