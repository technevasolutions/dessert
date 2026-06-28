import { cn } from '@/lib/utils';
import type { Role } from '@/lib/mock-data';
import { Logo } from './Logo';

const ROLES: { id: Role; label: string }[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'staff', label: 'Staff' },
  { id: 'admin', label: 'Admin' },
];

export function RoleSwitcher({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-3">
      <div className="hidden items-center gap-2 rounded-full border border-maroon/15 bg-cream/90 px-3 py-1.5 shadow-sm backdrop-blur sm:flex">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Demo
        </span>
        <span className="h-3 w-px bg-maroon/15" />
        <Logo size="sm" />
      </div>
      <div className="flex items-center gap-1 rounded-full border border-maroon/15 bg-cream/90 p-1 shadow-sm backdrop-blur">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Switch Role
        </span>
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              role === r.id
                ? 'bg-maroon text-cream shadow-sm'
                : 'text-ink-muted hover:text-maroon'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
