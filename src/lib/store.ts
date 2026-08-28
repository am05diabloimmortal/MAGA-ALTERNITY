import type { BoardState, ClassKey, Player } from './types';
import { CLASSES, ROOMS } from './types';

const STORAGE_KEY = 'alternity-v1';

function uid(prefix = 'p'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function seedPlayers(): Player[] {
  const seed: Array<Omit<Player, 'id' | 'roomId'> & { room?: string | null }> = [
    { name: 'Malthael#1188', class: 'Necromancer', role: 'DPS', cr: 9420, resonance: 8800, note: 'Online 7pm PT', room: 'exalted-1' },
    { name: 'Barbarosa#2241', class: 'Barbarian', role: 'Tank', cr: 9180, resonance: 7600, note: '', room: 'exalted-1' },
    { name: 'Imperius#3390', class: 'Crusader', role: 'Leader', cr: 9050, resonance: 7200, note: 'Shotcaller', room: 'exalted-1' },
    { name: 'Valthek#4412', class: 'Wizard', role: 'DPS', cr: 8990, resonance: 6900, note: '', room: 'exalted-1' },
    { name: 'Korrina#5567', class: 'Blood Knight', role: 'CC', cr: 8810, resonance: 6500, note: 'Late arrival', room: 'exalted-1' },
    { name: 'Zoltun#6678', class: 'Wizard', role: 'DPS', cr: 8700, resonance: 6200, note: '', room: 'exalted-2' },
    { name: 'Rakkis#7710', class: 'Crusader', role: 'Tank', cr: 8650, resonance: 6000, note: '', room: 'exalted-2' },
    { name: 'Lyndon#8823', class: 'Tempest', role: 'DPS', cr: 8590, resonance: 5800, note: 'Backup', room: 'exalted-2' },
    { name: 'Eirena#9934', class: 'Monk', role: 'CC', cr: 8400, resonance: 5400, note: '', room: 'eminent-1' },
    { name: 'Haedrig#1045', class: 'Warlock', role: 'DPS', cr: 8320, resonance: 5200, note: '', room: 'eminent-1' },
    { name: 'Asheara#1156', class: 'Druid', role: 'Tank', cr: 8250, resonance: 5000, note: 'Weekends only', room: 'eminent-1' },
    { name: 'Cydaea#1267', class: 'Necromancer', role: 'DPS', cr: 8100, resonance: 4800, note: '', room: 'famed-1' },
    { name: 'Azmodan#1378', class: 'Barbarian', role: 'DPS', cr: 7980, resonance: 4600, note: '', room: 'famed-1' },
    { name: 'Leah#1489', class: 'Wizard', role: 'CC', cr: 7800, resonance: 4400, note: 'Sub', room: 'reserved' },
    { name: 'Deckard#1590', class: 'Monk', role: 'DPS', cr: 7600, resonance: 4200, note: 'On call', room: 'reserved' },
    { name: 'Tyrael#1601', class: 'Crusader', role: 'Leader', cr: 0, resonance: 0, note: 'Unassigned', room: null },
  ];

  return seed.map((p) => ({
    id: uid(),
    name: p.name,
    class: p.class as ClassKey,
    role: p.role,
    cr: p.cr,
    resonance: p.resonance,
    note: p.note,
    roomId: p.room ?? null,
  }));
}

function defaultState(): BoardState {
  return {
    rooms: ROOMS,
    players: seedPlayers(),
  };
}

export function loadState(): BoardState {
  if (typeof localStorage === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as BoardState;
    return { ...parsed, rooms: ROOMS };
  } catch {
    return defaultState();
  }
}

export function saveState(state: BoardState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
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
  // Partial / fuzzy matches for common game export variants
  if (lower.includes('barbarian')) return 'Barbarian';
  if (lower.includes('crusader')) return 'Crusader';
  if (lower.includes('monk')) return 'Monk';
  if (lower.includes('wizard') || lower.includes('sorcer')) return 'Wizard';
  if (lower.includes('blood')) return 'Blood Knight';
  if (lower.includes('tempest')) return 'Tempest';
  if (lower.includes('druid')) return 'Druid';
  if (lower.includes('warlock')) return 'Warlock';
  if (lower.includes('necro')) return 'Necromancer';
  return 'Barbarian'; // safe default
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

  // Skip the first header line
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
