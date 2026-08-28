import type { BoardState, ClassKey, Player } from './types';
import { CLASSES, ROOMS } from './types';

const STORAGE_KEY = 'alternity_roster_data';

function uid(prefix = 'p'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyState(): BoardState {
  return {
    rooms: ROOMS,
    players: [],
  };
}

/**
 * Defensive localStorage read. Returns null on any failure so the caller
 * can fall back to a clean empty state instead of crashing.
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Defensive localStorage write. Swallows serialization and quota errors
 * so the app never crashes from a bad write.
 */
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Boot-time initialization. Checks localStorage under 'alternity_roster_data'
 * first. If valid data exists, loads it instantly. If empty or corrupt,
 * defaults to a clean empty array — never falls back to old placeholder data.
 */
export function loadState(): BoardState {
  if (typeof localStorage === 'undefined') return emptyState();

  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) {
    // No saved data — start clean with an empty roster
    const s = emptyState();
    safeSetItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }

  try {
    const parsed = JSON.parse(raw) as BoardState;
    // Validate the shape; if anything is off, start clean
    if (
      !parsed ||
      !Array.isArray(parsed.players) ||
      !Array.isArray(parsed.rooms)
    ) {
      return emptyState();
    }
    // Always use the canonical room definitions from code (rooms may change)
    return { ...parsed, rooms: ROOMS };
  } catch {
    // Corrupt JSON — start clean instead of crashing
    return emptyState();
  }
}

/**
 * Immediate, defensive write of the full roster state to localStorage.
 * Called after every mutation (add, edit, delete, assign, import).
 */
export function saveState(state: BoardState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Swallow all errors — never crash the app from a save failure
  }
}

/**
 * Force-save: writes immediately and synchronously, then returns whether it
 * succeeded. Used by the bulk import flow to guarantee data is persisted
 * before the UI updates.
 */
export function forceSaveRoster(players: Player[]): boolean {
  if (typeof localStorage === 'undefined') return false;
  const state: BoardState = { rooms: ROOMS, players };
  try {
    return safeSetItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return false;
  }
}

export function newPlayer(partial?: Partial<Omit<Player, 'id'>>): Player {
  return {
    id: uid(),
    name: partial?.name ?? '',
    class: partial?.class ?? 'Barbarian',
    role: partial?.role ?? 'DPS',
    cr: partial?.cr ?? 0,
    resonance: partial?.resonance ?? 0,
    note: partial?.note ?? '',
    roomId: partial?.roomId ?? null,
  };
}

/** Normalize a raw class string from the CSV export to a known ClassKey. */
export function normalizeClass(raw: string): ClassKey {
  const lower = raw.trim().toLowerCase().replace(/[_-]/g, ' ');
  const found = CLASSES.find((c) => c.toLowerCase() === lower);
  if (found) return found;
  if (lower.includes('barbarian')) return 'Barbarian';
  if (lower.includes('crusader')) return 'Crusader';
  if (lower.includes('monk')) return 'Monk';
  if (lower.includes('wizard') || lower.includes('sorcer')) return 'Wizard';
  if (lower.includes('blood')) return 'Blood Knight';
  if (lower.includes('tempest')) return 'Tempest';
  if (lower.includes('druid')) return 'Druid';
  if (lower.includes('warlock')) return 'Warlock';
  if (lower.includes('necro')) return 'Necromancer';
  return 'Barbarian';
}

export interface ParsedImport {
  players: Player[];
  skipped: number;
}

/**
 * Parse raw text from Diablo Immortal's "Export Member Data as CSV" feature.
 * Expected header: numbering,Name,Level,Class,Resonance,My Rank
 * Maps: col 2 -> Name, col 4 -> Class, col 5 -> Resonance.
 * CR defaults to 0, role defaults to DPS, all dumped into the Reserved pool.
 */
export function parseCsvImport(raw: string): ParsedImport {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { players: [], skipped: 0 };

  const dataLines = lines.slice(1);
  const players: Player[] = [];
  let skipped = 0;

  for (const line of dataLines) {
    const cols = line.split(',').map((c) => c.trim());
    const name = cols[1];
    if (!name) {
      skipped++;
      continue;
    }
    const rawClass = cols[3] ?? '';
    const rawResonance = cols[4] ?? '0';
    const resonance = Number(rawResonance.replace(/[^0-9]/g, '')) || 0;

    players.push(
      newPlayer({
        name,
        class: normalizeClass(rawClass),
        role: 'DPS',
        cr: 0,
        resonance,
        note: '',
        roomId: 'reserved',
      }),
    );
  }

  return { players, skipped };
}
