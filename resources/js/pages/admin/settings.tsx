import { PageTransition } from '@/components/shared/Animations';
import { Settings, Globe, DollarSign, Clock, Languages, Bell, Shield, Smartphone } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

const sections = [
  {
    title: 'General', icon: Globe, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/30',
    fields: ['Nombre de la plataforma', 'URL del sistema', 'Email de contacto'],
  },
  {
    title: 'Finanzas', icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30',
    fields: ['Moneda', 'Comisión por pedido (%)', 'Método de pago'],
  },
  {
    title: 'Regional', icon: Clock, gradient: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/30',
    fields: ['Zona horaria', 'Idioma', 'Formato de fecha'],
  },
  {
    title: 'Notificaciones', icon: Bell, gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/30',
    fields: ['Email de alertas', 'Notificaciones push', 'SMS habilitado'],
  },
];

export default function AdminSettings() {
  return (
    <AdminLayout>
      <PageTransition className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground text-sm">Ajustes generales de la plataforma</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity">
            Guardar cambios
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border bg-card overflow-hidden">
              {/* Section header */}
              <div className={`p-4 bg-gradient-to-r ${section.gradient} flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-white">{section.title}</h3>
              </div>
              {/* Fields */}
              <div className="p-5 space-y-3">
                {section.fields.map((field) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field}</label>
                    <div className="px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-muted-foreground">
                      Configurar...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-600">Zona de peligro</h3>
              <p className="text-xs text-muted-foreground">Acciones irreversibles del sistema</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors">
            Resetear configuración
          </button>
        </div>

      </PageTransition>
    </AdminLayout>
  );
}