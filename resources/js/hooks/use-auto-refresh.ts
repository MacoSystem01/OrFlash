import { useEffect } from 'react';
import { router } from '@inertiajs/react';

/**
 * Auto-refresca la página Inertia cada `interval` ms (default 30 s).
 * Se pausa si la pestaña está oculta y se reanuda cuando vuelve a ser visible.
 *
 * Usa router.visit() en lugar de router.reload() para poder preservar
 * el scroll y el estado (ReloadOptions excluye esas opciones en Inertia v2).
 */
export function useAutoRefresh(interval = 30_000) {
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const refresh = () => {
      router.visit(window.location.pathname + window.location.search, {
        preserveScroll: true,
        preserveState:  true,
        replace:        true,
      });
    };

    const run = () => {
      if (id !== null) return;
      id = setInterval(refresh, interval);
    };

    const pause = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    const handleVisibility = () => {
      document.hidden ? pause() : run();
    };

    run();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      pause();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [interval]);
}
