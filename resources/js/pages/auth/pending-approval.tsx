import { Head, router, usePage } from '@inertiajs/react';
import { Clock, CheckCircle, Mail, LogOut, ClipboardList } from 'lucide-react';
import DriverSetupModal from '@/components/driver/DriverSetupModal';

export default function PendingApproval() {
  const { auth, needsSetup } = usePage().props as any;
  const user = auth?.user;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Head title="Cuenta en revisión" />

      <div className="max-w-md w-full text-center space-y-6">

        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
          <Clock className="w-12 h-12 text-amber-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {needsSetup ? 'Completa tu perfil' : 'Cuenta en revisión'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {needsSetup
              ? 'Antes de enviar tu solicitud, necesitamos algunos datos adicionales.'
              : 'Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por correo cuando sea aprobada.'
            }
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 text-left">
          {needsSetup ? (
            [
              { icon: CheckCircle,   text: 'Datos personales registrados',          color: 'text-emerald-500' },
              { icon: ClipboardList, text: 'Completa fotos, dirección y vehículo',  color: 'text-amber-500'   },
              { icon: Clock,         text: 'Revisión admin (24-48h) tras envío',    color: 'text-blue-500'    },
            ]
          ) : (
            [
              { icon: CheckCircle, text: 'Datos recibidos correctamente',       color: 'text-emerald-500' },
              { icon: Clock,       text: 'Revisión en proceso (24-48 horas)',   color: 'text-amber-500'   },
              { icon: Mail,        text: 'Recibirás un correo de confirmación', color: 'text-blue-500'    },
            ]
          ).map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.post('/logout')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>

      {/* Modal de configuración inicial — solo para domiciliarios con perfil incompleto */}
      {needsSetup && user?.role === 'driver' && <DriverSetupModal />}
    </div>
  );
}
