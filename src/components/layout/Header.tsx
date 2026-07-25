'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/config/site';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Crew<span className="text-accent">Circle</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 text-foreground hover:text-accent transition-colors duration-200 rounded-lg"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'absolute top-full left-0 right-0 z-50 md:hidden',
          'bg-background border-b border-border shadow-xl',
          'transition-all duration-300 ease-in-out',
          isOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-2 opacity-0 pointer-events-none'
        )}
      >
        <nav className="px-6 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className="text-base font-medium text-muted-foreground hover:text-accent transition-colors duration-200 py-2.5 px-3 rounded-lg hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
