import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const isError = toast.type === "error";

        return (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur ${
              isError
                ? "border-red-200 bg-red-50/95 text-red-900 dark:border-red-500/30 dark:bg-red-950/95 dark:text-red-100"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-100"
            }`}
            key={toast.id}
          >
            {isError ? <AlertCircle className="mt-0.5" size={18} /> : <CheckCircle2 className="mt-0.5" size={18} />}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button className="rounded-full p-1 transition hover:bg-black/10" type="button" onClick={() => onDismiss(toast.id)}>
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
