import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { custom as store } from '@/routes/login';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Zap, Mail, Lock } from 'lucide-react';

type Props = {
  status?: string;
  canResetPassword: boolean;
  canRegister: boolean;
};

export default function Login({ status, canResetPassword, canRegister }: Props) {
  return (
    <div className="min-h-screen flex">
      <Head title="Iniciar sesión" />

      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-700 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-[-40px] w-40 h-40 rounded-full bg-white/5" />

        {/* Contenido */}
        <div className="relative z-10 text-center text-white space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto backdrop-blur-sm shadow-2xl">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">OrFlash</h1>
            <p className="text-violet-200 text-lg mt-2">Entregas rápidas a tu puerta</p>
          </div>
          <div className="space-y-3 text-left max-w-xs">
            {[
              { emoji: '⚡', text: 'Entrega en menos de 30 minutos' },
              { emoji: '🛒', text: 'Miles de productos disponibles' },
              { emoji: '📍', text: 'Seguimiento en tiempo real' },
              { emoji: '💳', text: 'Pagos seguros y fáciles' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm text-white/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo móvil */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">OrFlash</span>
          </div>

          {/* Encabezado */}
          <div>
            <h2 className="text-3xl font-bold">Bienvenido 👋</h2>
            <p className="text-muted-foreground mt-2">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Roles disponibles */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { role: 'Admin',        emoji: '👑', color: 'bg-violet-500/10 border-violet-500/30 text-violet-600' },
              { role: 'Cliente',      emoji: '🛒', color: 'bg-blue-500/10 border-blue-500/30 text-blue-600'       },
              { role: 'Tienda',       emoji: '🏪', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'},
              { role: 'Domiciliario', emoji: '🛵', color: 'bg-amber-500/10 border-amber-500/30 text-amber-600'    },
            ].map((r) => (
              <div key={r.role} className={`rounded-xl border p-2 text-center ${r.color}`}>
                <div className="text-xl">{r.emoji}</div>
                <div className="text-xs font-medium mt-0.5">{r.role}</div>
              </div>
            ))}
          </div>

          {status && (
            <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm font-medium text-center">
              {status}
            </div>
          )}

          {/* Formulario */}
          <Form
            {...store.form()}
            resetOnSuccess={['password']}
            className="space-y-5"
          >
            {({ processing, errors }) => (
              <>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoFocus
                      tabIndex={1}
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                      className="pl-10 h-12 rounded-xl border-border"
                    />
                  </div>
                  <InputError message={errors.email} />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                    {canResetPassword && (
                      <TextLink href={request()} className="text-xs text-violet-600 hover:text-violet-700" tabIndex={5}>
                        ¿Olvidaste tu contraseña?
                      </TextLink>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      tabIndex={2}
                      autoComplete="current-password"
                      placeholder="Tu contraseña"
                      className="pl-10 h-12 rounded-xl border-border"
                    />
                  </div>
                  <InputError message={errors.password} />
                </div>

                {/* Recuérdame */}
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" name="remember" tabIndex={3} />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Recordarme
                  </Label>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  tabIndex={4}
                  disabled={processing}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing && <Spinner />}
                  {processing ? 'Ingresando...' : 'Iniciar sesión'}
                </button>

                {canRegister && (
                  <p className="text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <TextLink href={register()} tabIndex={6} className="text-violet-600 font-semibold hover:text-violet-700">
                      Regístrate
                    </TextLink>
                  </p>
                )}
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}