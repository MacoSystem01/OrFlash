import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/Animations';
import { Truck, Phone, MapPin, Package } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import DriverMap from '@/components/map/DriverMap';

const drivers = [
  { id: '4', name: 'Carlos Domiciliario', phone: '3001112233', zone: 'Centro',  deliveries: 38, online: true,  lat: 3.4516, lng: -76.532 },
  { id: '5', name: 'Juan Repartidor',     phone: '3005556677', zone: 'Norte',   deliveries: 24, online: false, lat: 3.4600, lng: -76.5450 },
  { id: '6', name: 'Pedro Mensajero',     phone: '3009998877', zone: 'Sur',     deliveries: 51, online: true,  lat: 3.4280, lng: -76.5100 },
];

export default function AdminDrivers() {
  const online  = drivers.filter((d) => d.online).length;
  const offline = drivers.filter((d) => !d.online).length;

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Domiciliarios</h1>
            <p className="text-muted-foreground text-sm">{drivers.length} domiciliarios registrados</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              {online} online
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500 text-white shadow-lg shadow-slate-500/30">
              {offline} offline
            </span>
          </div>
        </div>

        {/* Mapa de domiciliarios activos */}
        <DriverMap drivers={drivers} centerLat={3.4400} centerLng={-76.5280} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total registrados', value: drivers.length, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/40' },
            { label: 'Online ahora',      value: online,         gradient: 'from-emerald-500 to-teal-600',  shadow: 'shadow-emerald-500/40' },
            { label: 'Entregas totales',  value: drivers.reduce((a, d) => a + d.deliveries, 0), gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/40' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 bg-linear-to-br ${s.gradient} text-white shadow-xl ${s.shadow}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-white/75 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <StaggerItem key={d.id}>
              <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${d.online ? 'bg-linear-to-br from-emerald-500 to-teal-600' : 'bg-linear-to-br from-slate-400 to-slate-500'}`}>
                    {d.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{d.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.online ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-500/15 text-slate-500'}`}>
                      {d.online ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{d.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Zona {d.zone}</div>
                  <div className="flex items-center gap-2"><Package className="w-3.5 h-3.5" />{d.deliveries} entregas realizadas</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </PageTransition>
    </AdminLayout>
  );
}