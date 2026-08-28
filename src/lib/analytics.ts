import type { Player, RoleKey, Room } from './types';
import { ROLES, TIER_ORDER } from './types';

export interface RoomStats {
  count: number;
  capacity: number | null;
  full: boolean;
  avgCr: number;
  totalResonance: number;
  roles: Record<RoleKey, number>;
}

export function computeRoomStats(room: Room, players: Player[]): RoomStats {
  const members = players.filter((p) => p.roomId === room.id);
  const count = members.length;
  const capacity = room.capacity;
  const full = capacity != null && count >= capacity;
  const avgCr = count > 0 ? Math.round(members.reduce((s, p) => s + p.cr, 0) / count) : 0;
  const totalResonance = members.reduce((s, p) => s + p.resonance, 0);
  const roles = ROLES.reduce((acc, r) => {
    acc[r] = members.filter((p) => p.role === r).length;
    return acc;
  }, {} as Record<RoleKey, number>);
  return { count, capacity, full, avgCr, totalResonance, roles };
}

export function roomMembers(roomId: string, players: Player[]): Player[] {
  return players.filter((p) => p.roomId === roomId);
}

export function unassignedPlayers(players: Player[]): Player[] {
  return players.filter((p) => p.roomId === null);
}

/** Plain-text roster suitable for pasting into Discord. */
export function rosterToText(rooms: Room[], players: Player[]): string {
  const lines: string[] = [];
  const header = '═══ WAR ROOM ROSTER ═══';
  lines.push(header);
  lines.push('');

  for (const tier of TIER_ORDER) {
    const tierRooms = rooms.filter((r) => r.tier === tier);
    for (const room of tierRooms) {
      const members = roomMembers(room.id, players).sort((a, b) => b.cr - a.cr);
      lines.push(`■ ${room.name} (${members.length}${room.capacity ? `/${room.capacity}` : ''})`);
      if (members.length === 0) {
        lines.push('   — Empty —');
      } else {
        members.forEach((m, i) => {
          lines.push(
            `   ${i + 1}. ${m.name} — ${m.class} | ${m.role} | CR ${m.cr} | Res ${m.resonance}${m.note ? ` | ${m.note}` : ''}`,
          );
        });
      }
      lines.push('');
    }
  }

  // Reserved pool
  const reserved = rooms.find((r) => r.tier === 'Reserved');
  if (reserved) {
    const members = roomMembers(reserved.id, players).sort((a, b) => b.cr - a.cr);
    lines.push(`■ ${reserved.name} (Standby Pool — ${members.length})`);
    if (members.length === 0) {
      lines.push('   — Empty —');
    } else {
      members.forEach((m, i) => {
        lines.push(
          `   ${i + 1}. ${m.name} — ${m.class} | ${m.role} | CR ${m.cr} | Res ${m.resonance}${m.note ? ` | ${m.note}` : ''}`,
        );
      });
    }
    lines.push('');
  }

  // Unassigned
  const unassigned = unassignedPlayers(players);
  if (unassigned.length > 0) {
    lines.push(`■ Unassigned (${unassigned.length})`);
    unassigned.forEach((m, i) => {
      lines.push(`   ${i + 1}. ${m.name} — ${m.class} | ${m.role} | CR ${m.cr}`);
    });
    lines.push('');
  }

  lines.push('═══ End of Roster ═══');
  return lines.join('\n');
}
