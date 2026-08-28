import { Crown, Gauge, Sparkles, Users } from 'lucide-react';
import type { Player, Room } from '@/lib/types';
import { TIER_ACCENT } from '@/lib/types';
import { computeRoomStats, roomMembers } from '@/lib/analytics';
import { ClassBadge, RoleBadge } from './Badges';

interface RoomCardProps {
  room: Room;
  players: Player[];
  compact?: boolean;
}

export function RoomCard({ room, players, compact = false }: RoomCardProps) {
  const stats = computeRoomStats(room, players);
  const members = roomMembers(room.id, players).sort((a, b) => b.cr - a.cr);
  const accent = TIER_ACCENT[room.tier];
  const isReserved = room.tier === 'Reserved';

  return (
    <div
      className={`card-surface flex flex-col overflow-hidden transition-shadow ${
        stats.full ? 'shadow-crimson-glow ring-1 ring-crimson-700/40' : ''
      }`}
    >
      <div className="border-b border-obsidian-700/60 bg-obsidian-900/50 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`font-display text-sm font-bold tracking-wide ${accent}`}>
            {room.name}
          </h3>
          <span
            className={`chip text-[10px] ${
              stats.full
                ? 'bg-crimson-900/60 text-crimson-200 ring-1 ring-crimson-700/60'
                : isReserved
                  ? 'bg-obsidian-700/50 text-obsidian-300'
                  : 'bg-obsidian-700/40 text-obsidian-200'
            }`}
          >
            <Users className="h-3 w-3" />
            {isReserved ? `${stats.count} standby` : `${stats.count}/${stats.capacity}`}
          </span>
        </div>

        {!compact && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-obsidian-300">
            <span className="inline-flex items-center gap-1" title="Average Combat Rating">
              <Gauge className="h-3 w-3 text-crimson-400" />
              CR {stats.avgCr.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1" title="Total Resonance">
              <Sparkles className="h-3 w-3 text-ember-400" />
              {stats.totalResonance.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1" title="Leaders">
              <Crown className="h-3 w-3 text-ember-300" />
              {stats.roles.Leader}L
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-sky-300">T{stats.roles.Tank}</span>
              <span className="text-crimson-300">D{stats.roles.DPS}</span>
              <span className="text-violet-300">C{stats.roles.CC}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1.5 p-2.5">
        {members.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs italic text-obsidian-500">
            {isReserved ? 'No standby players' : 'No assignments'}
          </p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="rounded-md border border-obsidian-700/50 bg-obsidian-800/40 px-2.5 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-obsidian-50">
                  {m.name}
                </span>
                <span className="shrink-0 text-xs font-bold text-crimson-300">
                  {m.cr.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <ClassBadge cls={m.class} />
                <RoleBadge role={m.role} />
              </div>
              {m.note && !compact && (
                <p className="mt-1 truncate text-[11px] text-obsidian-400" title={m.note}>
                  {m.note}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
