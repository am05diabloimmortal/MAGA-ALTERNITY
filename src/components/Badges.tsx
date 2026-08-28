import {
  Axe,
  Shield,
  Hand,
  Sparkles,
  Droplet,
  Wind,
  Leaf,
  Flame,
  Skull,
  Swords,
  Crown,
  Wand2,
  Target,
  HelpCircle,
} from 'lucide-react';
import type { ClassKey, RoleKey } from '@/lib/types';
import { CLASS_COLORS, ROLE_COLORS } from '@/lib/types';

const CLASS_ICON: Record<ClassKey, React.ComponentType<{ className?: string }>> = {
  Barbarian: Axe,
  Crusader: Shield,
  Monk: Hand,
  Wizard: Sparkles,
  'Blood Knight': Droplet,
  Tempest: Wind,
  Druid: Leaf,
  Warlock: Flame,
  Necromancer: Skull,
};

const ROLE_ICON: Record<RoleKey, React.ComponentType<{ className?: string }>> = {
  Tank: Shield,
  DPS: Swords,
  Leader: Crown,
  CC: Wand2,
};

export function ClassIcon({ cls, className }: { cls: ClassKey; className?: string }) {
  const Icon = CLASS_ICON[cls] ?? HelpCircle;
  return <Icon className={className} />;
}

export function RoleIcon({ role, className }: { role: RoleKey; className?: string }) {
  const Icon = ROLE_ICON[role] ?? Target;
  return <Icon className={className} />;
}

export function ClassBadge({ cls, size = 'sm' }: { cls: ClassKey; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span className={`inline-flex items-center gap-1.5 ${CLASS_COLORS[cls]}`}>
      <ClassIcon cls={cls} className={dim} />
      <span className="font-medium">{cls}</span>
    </span>
  );
}

export function RoleBadge({ role }: { role: RoleKey }) {
  const c = ROLE_COLORS[role];
  return (
    <span className={`chip ${c.bg} ${c.text} ring-1 ${c.ring}`}>
      <RoleIcon role={role} className="h-3 w-3" />
      {role}
    </span>
  );
}
