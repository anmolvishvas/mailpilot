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
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2.5 rounded-lg border p-3 shadow-md bg-card text-foreground transition-all animate-in slide-in-from-bottom-3",
              toast.type === "success" && "border-border",
              toast.type === "error" && "border-destructive/30",
              (!toast.type || toast.type === "info") && "border-border"
            )}
          >
            {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-foreground mt-0.5 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
            {(!toast.type || toast.type === "info") && <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex-1 text-xs">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              <div className="text-muted-foreground">{toast.description}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
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
