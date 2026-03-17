import { Head, router } from '@inertiajs/react';
import { Clock, CheckCircle, Mail, LogOut } from 'lucide-react';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Head title="Cuenta en revisión" />
      <div className="max-w-md w-full text-center space-y-6">

        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
          <Clock className="w-12 h-12 text-amber-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Cuenta en revisión</h1>
          <p className="text-muted-foreground mt-2">
            Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por correo cuando sea aprobada.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3 text-left">
          {[
            { icon: CheckCircle, text: 'Datos recibidos correctamente',    color: 'text-emerald-500' },
            { icon: Clock,       text: 'Revisión en proceso (24-48 horas)',color: 'text-amber-500'   },
            { icon: Mail,        text: 'Recibirás un correo de confirmación', color: 'text-blue-500' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
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
    </div>
  );
}