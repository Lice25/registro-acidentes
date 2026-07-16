import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMsg {
  id: string;
  kind: ToastKind;
  text: string;
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastMsg;
  onClose: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 3200);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? XCircle : Info;
  const accent =
    toast.kind === 'success'
      ? 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
      : toast.kind === 'error'
      ? 'border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200'
      : 'border-sky-500/40 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200';

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur animate-toast-in ${accent}`}
      role="status"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.text}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastMsg[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
