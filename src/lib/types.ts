export type ClassKey =
  | 'Barbarian'
  | 'Crusader'
  | 'Monk'
  | 'Wizard'
  | 'Blood Knight'
  | 'Tempest'
  | 'Druid'
  | 'Warlock'
  | 'Necromancer';

export type RoleKey = 'Tank' | 'DPS' | 'Leader' | 'CC';

export type RoomTier = 'Exalted' | 'Eminent' | 'Famed' | 'Proud' | 'Reserved';

export type ViewMode = 'editor' | 'public';

export interface Room {
  id: string;
  name: string;
  tier: RoomTier;
  capacity: number | null; // null = unlimited (Reserved)
}

export interface Player {
  id: string;
  name: string; // BattleTag
  class: ClassKey;
  role: RoleKey; // per-match dynamic role
  cr: number; // Combat Rating
  resonance: number;
  note: string; // Availability note
  roomId: string | null; // null = unassigned
}

export interface BoardState {
  players: Player[];
  rooms: Room[];
}

export const CLASSES: ClassKey[] = [
  'Barbarian',
  'Crusader',
  'Monk',
  'Wizard',
  'Blood Knight',
  'Tempest',
  'Druid',
  'Warlock',
  'Necromancer',
];

export const ROLES: RoleKey[] = ['Tank', 'DPS', 'Leader', 'CC'];

export const ROLE_COLORS: Record<RoleKey, { bg: string; text: string; ring: string }> = {
  Tank: { bg: 'bg-sky-900/40', text: 'text-sky-200', ring: 'ring-sky-700/50' },
  DPS: { bg: 'bg-crimson-900/40', text: 'text-crimson-200', ring: 'ring-crimson-700/50' },
  Leader: { bg: 'bg-ember-900/40', text: 'text-ember-200', ring: 'ring-ember-700/50' },
  CC: { bg: 'bg-violet-900/40', text: 'text-violet-200', ring: 'ring-violet-700/50' },
};

export const CLASS_COLORS: Record<ClassKey, string> = {
  Barbarian: 'text-amber-400',
  Crusader: 'text-yellow-200',
  Monk: 'text-emerald-300',
  Wizard: 'text-sky-300',
  'Blood Knight': 'text-rose-400',
  Tempest: 'text-cyan-300',
  Druid: 'text-lime-300',
  Warlock: 'text-fuchsia-300',
  Necromancer: 'text-green-500',
};

export const FIXED_ROOM_CAPACITY = 8;

export const ROOMS: Room[] = [
  { id: 'exalted-1', name: 'Exalted 1', tier: 'Exalted', capacity: FIXED_ROOM_CAPACITY },
  { id: 'exalted-2', name: 'Exalted 2', tier: 'Exalted', capacity: FIXED_ROOM_CAPACITY },
  { id: 'exalted-3', name: 'Exalted 3', tier: 'Exalted', capacity: FIXED_ROOM_CAPACITY },
  { id: 'eminent-1', name: 'Eminent 1', tier: 'Eminent', capacity: FIXED_ROOM_CAPACITY },
  { id: 'eminent-2', name: 'Eminent 2', tier: 'Eminent', capacity: FIXED_ROOM_CAPACITY },
  { id: 'eminent-3', name: 'Eminent 3', tier: 'Eminent', capacity: FIXED_ROOM_CAPACITY },
  { id: 'famed-1', name: 'Famed 1', tier: 'Famed', capacity: FIXED_ROOM_CAPACITY },
  { id: 'famed-2', name: 'Famed 2', tier: 'Famed', capacity: FIXED_ROOM_CAPACITY },
  { id: 'famed-3', name: 'Famed 3', tier: 'Famed', capacity: FIXED_ROOM_CAPACITY },
  { id: 'proud-1', name: 'Proud 1', tier: 'Proud', capacity: FIXED_ROOM_CAPACITY },
  { id: 'proud-2', name: 'Proud 2', tier: 'Proud', capacity: FIXED_ROOM_CAPACITY },
  { id: 'proud-3', name: 'Proud 3', tier: 'Proud', capacity: FIXED_ROOM_CAPACITY },
  { id: 'reserved', name: 'Reserved', tier: 'Reserved', capacity: null },
];

export const TIER_ORDER: RoomTier[] = ['Exalted', 'Eminent', 'Famed', 'Proud'];

export const TIER_ACCENT: Record<RoomTier, string> = {
  Exalted: 'text-ember-300',
  Eminent: 'text-crimson-300',
  Famed: 'text-sky-300',
  Proud: 'text-emerald-300',
  Reserved: 'text-obsidian-300',
};
