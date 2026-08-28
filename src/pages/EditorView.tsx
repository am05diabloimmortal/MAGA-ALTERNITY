import { useMemo, useState } from 'react';
import { Check, ClipboardCopy, FileUp, RotateCcw, Search, UserPlus } from 'lucide-react';
import type { BoardState, Player, RoleKey } from '@/lib/types';
import { TIER_ORDER } from '@/lib/types';
import { newPlayer, forceSaveRoster } from '@/lib/store';
import { rosterToText, unassignedPlayers } from '@/lib/analytics';
import { PlayerModal } from '@/components/PlayerModal';
import { ImportModal } from '@/components/ImportModal';
import {
  EditableRoomCard,
  UnassignedPool,
} from '@/components/EditableRoomCard';
import {
  FilterSidebar,
  DEFAULT_FILTERS,
  type FilterState,
} from '@/components/FilterSidebar';

interface EditorViewProps {
  state: BoardState;
  setState: (updater: (prev: BoardState) => BoardState) => void;
}

export function EditorView({ state, setState }: EditorViewProps) {
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [rosterQuery, setRosterQuery] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fixedRooms = state.rooms.filter((r) => r.tier !== 'Reserved');
  const reserved = state.rooms.find((r) => r.tier === 'Reserved')!;

  const filteredPlayers = useMemo(() => {
    const q = rosterQuery.trim().toLowerCase();
    return state.players.filter((p) => {
      if (filters.class !== 'all' && p.class !== filters.class) return false;
      if (filters.role !== 'all' && p.role !== filters.role) return false;
      if (p.cr < filters.crMin || p.cr > filters.crMax) return false;
      if (filters.unassignedOnly && p.roomId !== null) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [state.players, filters, rosterQuery]);

  const unassigned = unassignedPlayers(filteredPlayers);

  const openAdd = () => {
    setEditing(null);
    setPlayerModalOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditing(p);
    setPlayerModalOpen(true);
  };

  const handleSave = (data: Omit<Player, 'id'> & { id?: string }) => {
    setState((prev) => {
      if (data.id) {
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === data.id ? { ...p, ...data, id: data.id! } : p,
          ),
        };
      }
      return { ...prev, players: [...prev.players, newPlayer(data)] };
    });
    setPlayerModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }));
  };

  const movePlayer = (id: string, roomId: string | null) => {
    setState((prev) => {
      // Enforce strict 8-slot cap on fixed rooms
      if (roomId !== null) {
        const targetRoom = prev.rooms.find((r) => r.id === roomId);
        if (targetRoom && targetRoom.capacity !== null) {
          const currentCount = prev.players.filter(
            (p) => p.roomId === roomId && p.id !== id,
          ).length;
          if (currentCount >= targetRoom.capacity) return prev; // room full, reject move
        }
      }
      return {
        ...prev,
        players: prev.players.map((p) =>
          p.id === id ? { ...p, roomId } : p,
        ),
      };
    });
  };

  const handleRoleChange = (id: string, role: RoleKey) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, role } : p)),
    }));
  };

  const handleDropToRoom = (roomId: string) => {
    if (draggingId) {
      movePlayer(draggingId, roomId);
      setDraggingId(null);
    }
  };

  const handleDropToUnassigned = () => {
    if (draggingId) {
      movePlayer(draggingId, null);
      setDraggingId(null);
    }
  };

  const handleImport = (players: Player[]) => {
    // Force-save to localStorage BEFORE updating UI state, so clipboard data
    // is never lost even if a layout refresh happens mid-update.
    forceSaveRoster(players);
    // Destructive overwrite: wipe all previous players, replace with imported roster
    setState((prev) => ({
      ...prev,
      players,
    }));
  };

  const copyRoster = async () => {
    const text = rosterToText(state.rooms, state.players);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    }
  };

  const resetBoard = () => {
    if (confirm('Reset the entire board? This clears all players and starts with an empty roster.')) {
      try { localStorage.removeItem('alternity_roster_data'); } catch { /* ignore */ }
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-obsidian-50">
            Battleground Planner
          </h1>
          <p className="text-sm text-obsidian-400">
            Assign players, set match roles, and manage your roster.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openAdd} className="btn-primary">
            <UserPlus className="h-4 w-4" />
            Add Player
          </button>
          <button onClick={() => setImportOpen(true)} className="btn-ghost">
            <FileUp className="h-4 w-4 text-emerald-300" />
            Bulk Import
          </button>
          <button onClick={copyRoster} className="btn-ghost">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <ClipboardCopy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Roster'}
          </button>
          <button onClick={resetBoard} className="btn-ghost" title="Reset to seed data">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-obsidian-400" />
              <input
                type="text"
                value={rosterQuery}
                onChange={(e) => setRosterQuery(e.target.value)}
                placeholder="Search roster…"
                className="input pl-8"
              />
            </div>
          </div>

          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            resultCount={filteredPlayers.length}
            totalCount={state.players.length}
          />

          <UnassignedPool
            players={unassigned}
            onEdit={openEdit}
            onDelete={handleDelete}
            onMove={movePlayer}
            onRoleChange={handleRoleChange}
            onDragStart={setDraggingId}
            onDrop={handleDropToUnassigned}
          />
        </div>

        <div className="space-y-5">
          {TIER_ORDER.map((tier) => (
            <section key={tier}>
              <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-obsidian-400">
                {tier} Rooms
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {fixedRooms
                  .filter((r) => r.tier === tier)
                  .map((room) => (
                    <EditableRoomCard
                      key={room.id}
                      room={room}
                      players={filteredPlayers}
                      allPlayers={state.players}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onMove={movePlayer}
                      onRoleChange={handleRoleChange}
                      onDragStart={setDraggingId}
                      onDrop={handleDropToRoom}
                    />
                  ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-[0.2em] text-obsidian-400">
              Reserved · Standby Pool
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <EditableRoomCard
                room={reserved}
                players={filteredPlayers}
                allPlayers={state.players}
                onEdit={openEdit}
                onDelete={handleDelete}
                onMove={movePlayer}
                onRoleChange={handleRoleChange}
                onDragStart={setDraggingId}
                onDrop={handleDropToRoom}
              />
            </div>
          </section>

          {filteredPlayers.length === 0 && (
            <div className="card-surface flex flex-col items-center gap-2 px-6 py-10 text-center">
              <Search className="h-6 w-6 text-obsidian-500" />
              <p className="text-sm text-obsidian-400">
                No players match the current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      <PlayerModal
        open={playerModalOpen}
        initial={editing}
        onClose={() => setPlayerModalOpen(false)}
        onSave={handleSave}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
