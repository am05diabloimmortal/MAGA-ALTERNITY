import { ChevronDown, Pencil, Trash2, GripVertical } from 'lucide-react';
import type { ClassKey, Player, RoleKey, Room } from '@/lib/types';
import { CLASSES, ROLES, ROOMS, ROLE_COLORS } from '@/lib/types';
import { ClassBadge, RoleIcon } from '@/components/Badges';
import { AutoCompleteSlot } from '@/components/AutoCompleteSlot';

interface EditablePlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, roomId: string | null) => void;
  onRoleChange: (id: string, role: RoleKey) => void;
  onDragStart: (id: string) => void;
  draggable?: boolean;
}

export function EditablePlayerCard({
  player,
  onEdit,
  onDelete,
  onMove,
  onRoleChange,
  onDragStart,
  draggable = true,
}: EditablePlayerCardProps) {
  const rc = ROLE_COLORS[player.role];

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', player.id);
        onDragStart(player.id);
      }}
      className="group rounded-md border border-obsidian-700/50 bg-obsidian-800/50 px-2.5 py-2 transition-colors hover:border-crimson-700/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-obsidian-500 group-hover:text-obsidian-300" />
          <span className="truncate text-sm font-semibold text-obsidian-50">
            {player.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(player)}
            className="rounded p-1 text-obsidian-300 hover:bg-obsidian-700/60 hover:text-ember-300"
            aria-label={`Edit ${player.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(player.id)}
            className="rounded p-1 text-obsidian-300 hover:bg-crimson-900/40 hover:text-crimson-300"
            aria-label={`Delete ${player.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 pl-6">
        <ClassBadge cls={player.class} />
        <span className="text-xs font-bold text-crimson-300">
          CR {player.cr.toLocaleString()}
        </span>
        <span className="text-xs text-ember-300">
          Res {player.resonance.toLocaleString()}
        </span>
      </div>

      {player.note && (
        <p className="mt-1 truncate pl-6 text-[11px] text-obsidian-400" title={player.note}>
          {player.note}
        </p>
      )}

      {/* Prominent per-match Role dropdown */}
      <div className="mt-2 pl-6">
        <label className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-obsidian-400">
          <RoleIcon role={player.role} className="h-3 w-3" />
          Match Role
        </label>
        <div className={`relative ${rc.bg} rounded-md ring-1 ${rc.ring}`}>
          <select
            value={player.role}
            onChange={(e) => onRoleChange(player.id, e.target.value as RoleKey)}
            className={`w-full appearance-none rounded-md bg-transparent py-1.5 pl-2.5 pr-8 text-sm font-bold ${rc.text} outline-none cursor-pointer`}
            aria-label={`Set match role for ${player.name}`}
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-obsidian-900 text-obsidian-100">
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 ${rc.text}`} />
        </div>
      </div>

      {/* Quick move selector */}
      <div className="mt-2 pl-6">
        <select
          value={player.roomId ?? ''}
          onChange={(e) => onMove(player.id, e.target.value === '' ? null : e.target.value)}
          className="select px-2 py-1 text-xs"
          aria-label={`Move ${player.name} to room`}
        >
          <option value="">— Unassigned —</option>
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

interface EditableRoomCardProps {
  room: Room;
  players: Player[];
  allPlayers: Player[];
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, roomId: string | null) => void;
  onRoleChange: (id: string, role: RoleKey) => void;
  onDragStart: (id: string) => void;
  onDrop: (roomId: string) => void;
}

export function EditableRoomCard({
  room,
  players,
  allPlayers,
  onEdit,
  onDelete,
  onMove,
  onRoleChange,
  onDragStart,
  onDrop,
}: EditableRoomCardProps) {
  const members = players
    .filter((p) => p.roomId === room.id)
    .sort((a, b) => b.cr - a.cr);
  const isReserved = room.tier === 'Reserved';
  const capacity = room.capacity ?? 0;
  const count = members.length;
  const full = !isReserved && count >= capacity;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (full) return; // strictly enforce 8-slot cap
    onDrop(room.id);
  };

  return (
    <div
      onDragOver={(e) => {
        // Allow drag-over but don't show drop cursor when full
        e.preventDefault();
      }}
      onDrop={handleDrop}
      className={`card-surface flex flex-col overflow-hidden transition-all ${
        full ? 'shadow-crimson-glow ring-1 ring-crimson-700/40' : ''
      }`}
    >
      <div className="border-b border-obsidian-700/60 bg-obsidian-900/50 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold tracking-wide text-obsidian-50">
            {room.name}
          </h3>
          <span
            className={`chip text-[10px] ${
              full
                ? 'bg-crimson-900/60 text-crimson-200 ring-1 ring-crimson-700/60'
                : 'bg-obsidian-700/40 text-obsidian-200'
            }`}
          >
            {isReserved ? `${count} standby` : `${count}/${room.capacity}`}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-obsidian-300">
          <span className="inline-flex items-center gap-1" title="Average CR">
            <span className="text-crimson-400">CR</span> {count > 0 ? Math.round(members.reduce((s, p) => s + p.cr, 0) / count).toLocaleString() : '—'}
          </span>
          <span className="inline-flex items-center gap-1" title="Total Resonance">
            <span className="text-ember-400">Res</span> {members.reduce((s, p) => s + p.resonance, 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {(['Tank', 'DPS', 'Leader', 'CC'] as RoleKey[]).map((r) => {
              const n = members.filter((p) => p.role === r).length;
              return (
                <span key={r} className={n > 0 ? '' : 'text-obsidian-600'}>
                  {r[0]}{n}
                </span>
              );
            })}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 p-2.5">
        {members.length === 0 && !full && (
          <AutoCompleteSlot
            allPlayers={allPlayers}
            onAssign={(playerId) => onMove(playerId, room.id)}
          />
        )}
        {members.length > 0 && (
          members.map((m) => (
            <EditablePlayerCard
              key={m.id}
              player={m}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              onRoleChange={onRoleChange}
              onDragStart={onDragStart}
            />
          ))
        )}
        {/* Auto-complete slot to fill remaining empty slots (when not full) */}
        {members.length > 0 && !full && (
          <AutoCompleteSlot
            allPlayers={allPlayers}
            onAssign={(playerId) => onMove(playerId, room.id)}
          />
        )}
        {full && !isReserved && (
          <p className="rounded-md border border-crimson-800/50 bg-crimson-900/20 px-2 py-2 text-center text-[11px] font-semibold text-crimson-300">
            Room full — 8/8 slots occupied
          </p>
        )}
      </div>
    </div>
  );
}

interface UnassignedPoolProps {
  players: Player[];
  onEdit: (p: Player) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, roomId: string | null) => void;
  onRoleChange: (id: string, role: RoleKey) => void;
  onDragStart: (id: string) => void;
  onDrop: () => void;
}

export function UnassignedPool({
  players,
  onEdit,
  onDelete,
  onMove,
  onRoleChange,
  onDragStart,
  onDrop,
}: UnassignedPoolProps) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className="card-surface flex flex-col overflow-hidden border-dashed border-obsidian-600/70"
    >
      <div className="border-b border-obsidian-700/60 bg-obsidian-900/40 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold tracking-wide text-obsidian-300">
            Unassigned
          </h3>
          <span className="chip bg-obsidian-700/40 text-[10px] text-obsidian-200">
            {players.length} waiting
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 p-2.5">
        {players.length === 0 ? (
          <p className="rounded-md border border-dashed border-obsidian-700/60 px-2 py-4 text-center text-xs italic text-obsidian-500">
            Drop here to unassign
          </p>
        ) : (
          players
            .sort((a, b) => b.cr - a.cr)
            .map((m) => (
              <EditablePlayerCard
                key={m.id}
                player={m}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
                onRoleChange={onRoleChange}
                onDragStart={onDragStart}
              />
            ))
        )}
      </div>
    </div>
  );
}

export { CLASSES, ROLES };
