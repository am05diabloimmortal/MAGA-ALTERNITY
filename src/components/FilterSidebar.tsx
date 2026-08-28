import { Filter, X } from 'lucide-react';
import type { ClassKey, RoleKey } from '@/lib/types';
import { CLASSES, ROLES } from '@/lib/types';
import { ClassIcon, RoleIcon } from '@/components/Badges';

export interface FilterState {
  class: ClassKey | 'all';
  role: RoleKey | 'all';
  crMin: number;
  crMax: number;
  unassignedOnly: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  class: 'all',
  role: 'all',
  crMin: 0,
  crMax: 10000,
  unassignedOnly: false,
};

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

export function FilterSidebar({ filters, setFilters, resultCount, totalCount }: FilterSidebarProps) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters({ ...filters, [key]: value });

  return (
    <aside className="card-surface flex h-fit flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-wide text-obsidian-100">
          <Filter className="h-4 w-4 text-crimson-400" />
          Roster Filters
        </h3>
        <button
          onClick={() => setFilters(DEFAULT_FILTERS)}
          className="text-xs text-obsidian-400 hover:text-obsidian-200"
          title="Reset filters"
        >
          Reset
        </button>
      </div>

      <div className="text-xs text-obsidian-400">
        Showing <span className="font-bold text-obsidian-100">{resultCount}</span> of {totalCount} players
      </div>

      {/* Unassigned only */}
      <label className="flex cursor-pointer items-center justify-between rounded-md border border-obsidian-700/50 bg-obsidian-900/40 px-3 py-2">
        <span className="text-sm font-semibold text-obsidian-200">Unassigned Only</span>
        <input
          type="checkbox"
          checked={filters.unassignedOnly}
          onChange={(e) => set('unassignedOnly', e.target.checked)}
          className="h-4 w-4 accent-crimson-600"
        />
      </label>

      {/* Class filter */}
      <div>
        <span className="label">Class</span>
        <div className="grid grid-cols-1 gap-1">
          <button
            onClick={() => set('class', 'all')}
            className={`flex items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors ${
              filters.class === 'all'
                ? 'bg-crimson-800/40 text-crimson-100'
                : 'text-obsidian-300 hover:bg-obsidian-800/50'
            }`}
          >
            All Classes
          </button>
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => set('class', c)}
              className={`flex items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                filters.class === c
                  ? 'bg-crimson-800/40 text-crimson-100'
                  : 'text-obsidian-300 hover:bg-obsidian-800/50'
              }`}
            >
              <ClassIcon cls={c} className="h-3.5 w-3.5" />
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Role filter */}
      <div>
        <span className="label">Role</span>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => set('role', 'all')}
            className={`rounded px-2 py-1 text-left text-xs transition-colors ${
              filters.role === 'all'
                ? 'bg-crimson-800/40 text-crimson-100'
                : 'text-obsidian-300 hover:bg-obsidian-800/50'
            }`}
          >
            All Roles
          </button>
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => set('role', r)}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-colors ${
                filters.role === r
                  ? 'bg-crimson-800/40 text-crimson-100'
                  : 'text-obsidian-300 hover:bg-obsidian-800/50'
              }`}
            >
              <RoleIcon role={r} className="h-3.5 w-3.5" />
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* CR range */}
      <div>
        <span className="label">Combat Rating Range</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={filters.crMin}
            onChange={(e) => set('crMin', Math.max(0, Number(e.target.value) || 0))}
            className="input px-2 py-1.5 text-xs"
            placeholder="Min"
          />
          <X className="h-3 w-3 text-obsidian-500" />
          <input
            type="number"
            min={0}
            value={filters.crMax}
            onChange={(e) => set('crMax', Math.max(0, Number(e.target.value) || 0))}
            className="input px-2 py-1.5 text-xs"
            placeholder="Max"
          />
        </div>
      </div>
    </aside>
  );
}
