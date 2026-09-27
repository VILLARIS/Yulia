import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

/**
 * Confirmaciones visuales efímeras. Sustituyen a los `alert()` del navegador,
 * que bloquean la interfaz y no son anunciados de forma fiable. Los mensajes se
 * exponen en una región `aria-live` para que se anuncien sin robar el foco.
 */
const ToastContext = createContext(null);

const TONES = {
  success: { classes: 'border-emerald-200 bg-white text-success', Icon: CheckCircle2 },
  info: { classes: 'border-blue-200 bg-white text-action', Icon: Info },
};

const AUTO_DISMISS_MS = 5200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      counterRef.current += 1;
      const id = `toast-${counterRef.current}`;
      setToasts((current) => [...current, { id, tone: 'info', ...toast }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 px-4 pb-4 sm:items-end sm:px-6 sm:pb-6"
      >
        {toasts.map((toast) => {
          const { classes, Icon } = TONES[toast.tone] ?? TONES.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-panel border px-4 py-3 shadow-lg ${classes}`}
            >
              <Icon size={19} aria-hidden="true" className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-navy">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 leading-6 text-slate-600">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={`Descartar aviso: ${toast.title}`}
                className="-mr-1 -mt-1 grid size-11 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider.');
  }
  return context;
}
