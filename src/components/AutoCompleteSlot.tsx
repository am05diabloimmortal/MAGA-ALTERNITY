import { useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Player } from '@/lib/types';
import { ClassBadge } from '@/components/Badges';

interface AutoCompleteSlotProps {
  allPlayers: Player[];
  onAssign: (playerId: string) => void;
  disabled?: boolean;
}

/**
 * An empty room slot that acts as an intelligent auto-complete search box.
 * Typing a name/BattleTag searches the roster; selecting a result binds that
 * player's full profile (Class, Resonance, CR, Role) into this room slot.
 */
export function AutoCompleteSlot({ allPlayers, onAssign, disabled }: AutoCompleteSlotProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalized = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!normalized) return [];
    return allPlayers
      .filter((p) => p.name.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [normalized, allPlayers]);

  const pick = (player: Player) => {
    onAssign(player.id);
    setQuery('');
    setFocused(false);
  };

  const blur = () => {
    // Delay so click events fire before blur closes the dropdown
    setTimeout(() => setFocused(false), 150);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5 rounded-md border border-dashed border-obsidian-700/60 bg-obsidian-900/40 px-2 py-1.5 transition-colors focus-within:border-emerald-700/50">
        <Search className="h-3.5 w-3.5 shrink-0 text-obsidian-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={blur}
          disabled={disabled}
          placeholder="Search name to assign…"
          className="w-full bg-transparent text-xs text-obsidian-100 placeholder-obsidian-500 outline-none disabled:opacity-50"
          aria-label="Search player by name to assign to this room slot"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="shrink-0 text-obsidian-500 hover:text-obsidian-200"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {focused && normalized && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-obsidian-700 bg-obsidian-900 shadow-lg">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-xs italic text-obsidian-500">
              No matching players found
            </p>
          ) : (
            matches.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(p);
                }}
                className="flex w-full items-center justify-between gap-2 border-b border-obsidian-800/60 px-3 py-1.5 text-left transition-colors last:border-0 hover:bg-obsidian-800/70"
              >
                <span className="truncate text-xs font-semibold text-obsidian-100">
                  {p.name}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <ClassBadge cls={p.class} />
                  <span className="text-[10px] text-obsidian-400">
                    CR {p.cr.toLocaleString()} · Res {p.resonance.toLocaleString()}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
