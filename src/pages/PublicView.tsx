import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { BoardState } from '@/lib/types';
import { TIER_ORDER } from '@/lib/types';
import { RoomCard } from '@/components/RoomCard';
import { ClassBadge, RoleBadge } from '@/components/Badges';

interface PublicViewProps {
  state: BoardState;
}

export function PublicView({ state }: PublicViewProps) {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const matchedPlayer = useMemo(() => {
    if (!normalized) return null;
    return (
      state.players.find((p) => p.name.toLowerCase().includes(normalized)) ?? null
    );
  }, [normalized, state.players]);

  const matchedRoom = useMemo(() => {
    if (!matchedPlayer || !matchedPlayer.roomId) return null;
    return state.rooms.find((r) => r.id === matchedPlayer.roomId) ?? null;
  }, [matchedPlayer, state.rooms]);

  const fixedRooms = state.rooms.filter((r) => r.tier !== 'Reserved');
  const reserved = state.rooms.find((r) => r.tier === 'Reserved')!;

  return (
    <div className="animate-fade-in space-y-6">
      <section className="card-surface relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-obsidian-900/40" />
        <div className="relative">
          <h1 className="font-display text-2xl font-bold tracking-wide text-obsidian-50 sm:text-3xl">
            Find Your Battleground
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-obsidian-300">
            Enter your BattleTag to jump straight to your assigned room, or browse all
            active rooms below.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-obsidian-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search BattleTag e.g. Malthael#1188"
                className="input pl-9 pr-9"
                aria-label="Search by BattleTag"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {normalized && matchedPlayer && (
            <div className="mt-3 rounded-md border border-emerald-700/50 bg-emerald-900/20 p-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-obsidian-50">
                    {matchedPlayer.name}
                  </span>
                  <ClassBadge cls={matchedPlayer.class} size="md" />
                  <RoleBadge role={matchedPlayer.role} />
                  <span className="text-sm font-bold text-crimson-300">
                    CR {matchedPlayer.cr.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-obsidian-200">
                  {matchedRoom ? (
                    <>Assigned to <span className="text-ember-300">{matchedRoom.name}</span></>
                  ) : (
                    <span className="text-amber-300">Not yet assigned</span>
                  )}
                </span>
              </div>
            </div>
          )}
          {normalized && !matchedPlayer && (
            <p className="mt-3 text-sm text-amber-300">
              No player found matching "{query}".
            </p>
          )}
        </div>
      </section>

      <div className="space-y-6">
        {TIER_ORDER.map((tier) => (
          <section key={tier}>
            <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-obsidian-400">
              {tier} Rooms
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fixedRooms
                .filter((r) => r.tier === tier)
                .map((room) => (
                  <RoomCard key={room.id} room={room} players={state.players} />
                ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-obsidian-400">
            Reserved · Standby Pool
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RoomCard room={reserved} players={state.players} />
          </div>
        </section>
      </div>
    </div>
  );
}
