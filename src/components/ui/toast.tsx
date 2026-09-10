"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (msg: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...msg, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5",
              toast.type === "success" && "border-emerald-500/30 bg-emerald-950/90 text-emerald-100 dark:bg-emerald-950/95",
              toast.type === "error" && "border-rose-500/30 bg-rose-950/90 text-rose-100 dark:bg-rose-950/95",
              (!toast.type || toast.type === "info") && "border-border bg-card/95 text-card-foreground shadow-2xl"
            )}
          >
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />}
            {(!toast.type || toast.type === "info") && <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />}
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              <div>{toast.description}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const { addToast } = React.useContext(ToastContext);

  return {
    toast: (msg: { title?: string; description: string; type?: ToastType }) => addToast(msg),
    success: (description: string, title?: string) => addToast({ description, title, type: "success" }),
    error: (description: string, title?: string) => addToast({ description, title, type: "error" }),
    info: (description: string, title?: string) => addToast({ description, title, type: "info" }),
  };
}
