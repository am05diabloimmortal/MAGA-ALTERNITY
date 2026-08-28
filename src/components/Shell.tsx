import { Clover, Eye, Pencil } from 'lucide-react';
import type { ViewMode } from '@/lib/types';

interface ShellProps {
  children: React.ReactNode;
  viewMode: ViewMode;
  onToggleView: () => void;
}

export function Shell({ children, viewMode, onToggleView }: ShellProps) {
  const isEditor = viewMode === 'editor';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-obsidian-700/70 bg-obsidian-950/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          {/* Brand: Clover + Alternity + tagline */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-700/40 bg-emerald-900/20 text-emerald-300 shadow-ember-glow">
              <Clover className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <span className="block font-display text-base font-bold tracking-wide text-obsidian-50">
                Alternity
              </span>
              <span className="block text-[10px] lowercase tracking-wide text-obsidian-400">
                make alternity great again
              </span>
            </div>
          </div>

          {/* View Mode toggle */}
          <button
            onClick={onToggleView}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              isEditor
                ? 'border-crimson-700/50 bg-crimson-900/30 text-crimson-200'
                : 'border-sky-700/50 bg-sky-900/30 text-sky-200'
            }`}
            title={isEditor ? 'Switch to read-only public view' : 'Switch to editor mode'}
          >
            {isEditor ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isEditor ? 'Editor Mode' : 'Public View'}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-obsidian-800/60 px-4 py-4 text-center text-[11px] uppercase tracking-wider text-obsidian-500">
        Alternity · Unofficial Diablo Immortal community planner
      </footer>
    </div>
  );
}
