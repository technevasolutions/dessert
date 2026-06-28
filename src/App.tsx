import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { RoleSwitcher } from '@/components/brand/RoleSwitcher';
import { CustomerPortal } from '@/views/CustomerPortal';
import { StaffDashboard } from '@/views/StaffDashboard';
import { AdminPanel } from '@/views/AdminPanel';
import { StoreProvider } from '@/lib/store';
import type { Role } from '@/lib/mock-data';

function App() {
  const [role, setRole] = useState<Role>('customer');

  // Keep the demo URL hash in sync with the active role.
  useEffect(() => {
    const fromHash = window.location.hash.replace('#/', '') as Role;
    if (['customer', 'staff', 'admin'].includes(fromHash)) {
      setRole(fromHash);
    }
    const onHash = () => {
      const h = window.location.hash.replace('#/', '') as Role;
      if (['customer', 'staff', 'admin'].includes(h)) setRole(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function changeRole(r: Role) {
    setRole(r);
    window.location.hash = `/${r}`;
  }

  return (
    <StoreProvider>
      <div className="min-h-screen">
        <RoleSwitcher role={role} onChange={changeRole} />
        <main key={role} className="animate-fade-in">
          {role === 'customer' && <CustomerPortal />}
          {role === 'staff' && <StaffDashboard />}
          {role === 'admin' && <AdminPanel />}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                'group toast group-[.toaster]:bg-cream-50 group-[.toaster]:text-ink group-[.toaster]:border-maroon/20 group-[.toaster]:shadow-lg',
              description: 'group-[.toast]:text-ink-muted',
            },
          }}
        />
      </div>
    </StoreProvider>
  );
}

export default App;
