import { PageTransition } from '@/components/shared/Animations';
import { Search, Users, Shield, Store, Truck } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

const users = [
  { id: '1', name: 'Admin OrFlash',  email: 'admin@orflash.com',  role: 'admin',  phone: '3001234567' },
  { id: '2', name: 'Cliente Test',   email: 'client@orflash.com', role: 'client', phone: '3007654321' },
  { id: '3', name: 'Tienda Test',    email: 'store@orflash.com',  role: 'store',  phone: '3009876543' },
  { id: '4', name: 'Domiciliario',   email: 'driver@orflash.com', role: 'driver', phone: '3001112233' },
];

const roleConfig: Record<string, { label: string; gradient: string; icon: any }> = {
  admin:  { label: 'Admin',        gradient: 'from-violet-500 to-purple-600', icon: Shield },
  client: { label: 'Cliente',      gradient: 'from-blue-500 to-cyan-600',     icon: Users  },
  store:  { label: 'Tienda',       gradient: 'from-emerald-500 to-teal-600',  icon: Store  },
  driver: { label: 'Domiciliario', gradient: 'from-orange-500 to-amber-500',  icon: Truck  },
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground text-sm">{users.length} usuarios registrados</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card w-64 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuario..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(roleConfig).map(([role, cfg]) => {
            const count = users.filter((u) => u.role === role).length;
            const Icon = cfg.icon;
            return (
              <div key={role} className={`rounded-2xl p-4 bg-linear-to-br ${cfg.gradient} text-white shadow-lg`}>
                <Icon className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-white/75">{cfg.label}s</p>
              </div>
            );
          })}
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Usuario</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Email</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Rol</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-left">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const cfg = roleConfig[u.role];
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${cfg.gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-linear-to-r ${cfg.gradient} shadow-sm`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{u.phone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </PageTransition>
    </AdminLayout>
  );
}