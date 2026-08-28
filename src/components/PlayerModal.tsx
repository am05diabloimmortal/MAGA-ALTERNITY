import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ClassKey, Player, RoleKey } from '@/lib/types';
import { CLASSES, ROLES, ROOMS } from '@/lib/types';

interface PlayerModalProps {
  open: boolean;
  initial: Player | null; // null = create
  onClose: () => void;
  onSave: (data: Omit<Player, 'id'> & { id?: string }) => void;
}

const EMPTY: Omit<Player, 'id'> = {
  name: '',
  class: 'Barbarian',
  role: 'DPS',
  cr: 0,
  resonance: 0,
  note: '',
  roomId: null,
};

export function PlayerModal({ open, initial, onClose, onSave }: PlayerModalProps) {
  const [form, setForm] = useState<Omit<Player, 'id'>>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : EMPTY);
    }
  }, [open, initial]);

  if (!open) return null;

  const isEdit = !!initial;
  const set = <K extends keyof Omit<Player, 'id'>>(key: K, value: Omit<Player, 'id'>[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: initial?.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-obsidian-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="card-surface w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-obsidian-700/60 bg-obsidian-900/50 px-5 py-3">
          <h2 className="font-display text-base font-bold tracking-wide text-obsidian-50">
            {isEdit ? 'Edit Player' : 'Add Player'}
          </h2>
          <button onClick={onClose} className="text-obsidian-400 hover:text-obsidian-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3.5 p-5">
          <div>
            <label className="label" htmlFor="p-name">Name / BattleTag</label>
            <input
              id="p-name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input"
              placeholder="Malthael#1188"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="p-class">Class</label>
              <select
                id="p-class"
                value={form.class}
                onChange={(e) => set('class', e.target.value as ClassKey)}
                className="select"
              >
                {CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="p-role">Role</label>
              <select
                id="p-role"
                value={form.role}
                onChange={(e) => set('role', e.target.value as RoleKey)}
                className="select"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="p-cr">Combat Rating (CR)</label>
              <input
                id="p-cr"
                type="number"
                min={0}
                value={form.cr}
                onChange={(e) => set('cr', Math.max(0, Number(e.target.value) || 0))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="p-res">Resonance</label>
              <input
                id="p-res"
                type="number"
                min={0}
                value={form.resonance}
                onChange={(e) => set('resonance', Math.max(0, Number(e.target.value) || 0))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="p-room">Room Assignment</label>
            <select
              id="p-room"
              value={form.roomId ?? ''}
              onChange={(e) => set('roomId', e.target.value === '' ? null : e.target.value)}
              className="select"
            >
              <option value="">— Unassigned —</option>
              {ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}{r.tier === 'Reserved' ? ' (Standby)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="p-note">Availability Note</label>
            <input
              id="p-note"
              type="text"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              className="input"
              placeholder="e.g. Online 7pm PT"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save Changes' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
