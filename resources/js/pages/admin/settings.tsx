import { PageTransition } from '@/components/shared/Animations';
import { Settings, Globe, DollarSign, Clock, Languages, Bell, Shield, Smartphone, Check, AlertCircle } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useState } from 'react';

const initialSettings = {
  general: {
    platformName: 'OrFlash',
    systemUrl: 'https://orflash.local',
    contactEmail: 'support@orflash.com',
  },
  finances: {
    currency: 'COP',
    commissionPercentage: '15',
    paymentMethod: 'Stripe',
  },
  regional: {
    timezone: 'America/Bogota',
    language: 'Español',
    dateFormat: 'DD/MM/YYYY',
  },
  notifications: {
    alertEmail: 'alerts@orflash.com',
    pushEnabled: true,
    smsEnabled: false,
  },
};

const sections = [
  {
    id: 'general',
    title: 'General',
    icon: Globe,
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/30',
    fields: [
      { key: 'contactEmail', label: 'Email de contacto', type: 'email', placeholder: 'support@orflash.com' },
    ],
  },
  {
    id: 'finances',
    title: 'Finanzas',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    fields: [
      { key: 'currency', label: 'Moneda', type: 'select', options: ['COP', 'USD', 'EUR', 'MXN'] },
      { key: 'storeCommissionPercentage', label: 'Comisión Tienda (%)', type: 'number', placeholder: '15' },
      { key: 'driverCommissionPercentage', label: 'Comisión Domiciliario (%)', type: 'number', placeholder: '15' },
      { key: 'paymentMethod', label: 'Método de pago', type: 'select', options: ['Stripe', 'PayPal', 'MercadoPago'] },
    ],
  },
  {
    id: 'regional',
    title: 'Regional',
    icon: Clock,
    gradient: 'from-blue-500 to-cyan-600',
    shadow: 'shadow-blue-500/30',
    fields: [
      { key: 'timezone', label: 'Zona horaria', type: 'select', options: ['America/Bogota', 'America/Mexico_City', 'America/Buenos_Aires'] },
      { key: 'language', label: 'Idioma', type: 'select', options: ['Español', 'Inglés', 'Portugués'] },
      { key: 'dateFormat', label: 'Formato de fecha', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
    ],
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    icon: Bell,
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/30',
    fields: [
      { key: 'alertEmail', label: 'Email de alertas', type: 'email', placeholder: 'alerts@orflash.com' },
      { key: 'pushEnabled', label: 'Notificaciones push', type: 'checkbox' },
      { key: 'smsEnabled', label: 'SMS habilitado', type: 'checkbox' },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      // Validaciones básicas
      if (!settings.general.platformName.trim()) {
        setError('El nombre de la plataforma es requerido');
        return;
      }
      if (!settings.general.contactEmail.includes('@')) {
        setError('Email de contacto inválido');
        return;
      }
      if (isNaN(Number(settings.finances.commissionPercentage)) || Number(settings.finances.commissionPercentage) < 0) {
        setError('La comisión debe ser un número válido');
        return;
      }

      // Guardar en localStorage (simulación de base de datos)
      localStorage.setItem('orflash_settings', JSON.stringify(settings));

      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Error al guardar la configuración');
    }
  };

  return (
    <AdminLayout>
      <PageTransition className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground text-sm">Ajustes generales de la plataforma</p>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity"
          >
            Guardar cambios
          </button>
        </div>

        {/* Alerts */}
        {saved && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-600 font-medium">Configuración guardada correctamente</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Settings sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* COLUMNA IZQUIERDA: General + Regional */}
          <div className="flex flex-col gap-4">
            {sections.filter(s => s.id === 'general' || s.id === 'regional').map((section) => (
              <div key={section.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`p-4 bg-linear-to-r ${section.gradient} flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {section.fields.map((field) => {
                    const value = settings[section.id as keyof typeof settings][field.key as any];
                    if (field.type === 'checkbox') {
                      return (
                        <div key={field.key} className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">{field.label}</label>
                          <button
                            onClick={() => handleChange(section.id, field.key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      );
                    }
                    if (field.type === 'select') {
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
                          <select
                            value={value}
                            onChange={(e) => handleChange(section.id, field.key, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-foreground outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                          >
                            {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
                        <input
                          type={field.type}
                          value={value}
                          onChange={(e) => handleChange(section.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* COLUMNA DERECHA: Finanzas + Notificaciones */}
          <div className="flex flex-col gap-4">
            {sections.filter(s => s.id === 'finances' || s.id === 'notifications').map((section) => (
              <div key={section.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className={`p-4 bg-linear-to-r ${section.gradient} flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-white">{section.title}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {section.fields.map((field) => {
                    const value = settings[section.id as keyof typeof settings][field.key as any];
                    if (field.type === 'checkbox') {
                      return (
                        <div key={field.key} className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">{field.label}</label>
                          <button
                            onClick={() => handleChange(section.id, field.key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      );
                    }
                    if (field.type === 'select') {
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
                          <select
                            value={value}
                            onChange={(e) => handleChange(section.id, field.key, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-foreground outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                          >
                            {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </div>
                      );
                    }
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
                        <input
                          type={field.type}
                          value={value}
                          onChange={(e) => handleChange(section.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

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
          <button
            onClick={() => {
              if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
                setSettings(initialSettings);
                localStorage.removeItem('orflash_settings');
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors"
          >
            Resetear configuración
          </button>
        </div>
      </PageTransition>
    </AdminLayout>
  );
}