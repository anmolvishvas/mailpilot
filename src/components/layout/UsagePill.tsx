"use client";

import * as React from "react";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import type { UserUsageStatus } from "@/types";
import { cn } from "@/lib/utils";

interface UsagePillProps {
  initialUsage?: UserUsageStatus | null;
  className?: string;
}

export function UsagePill({ initialUsage, className }: UsagePillProps) {
  const [usage, setUsage] = React.useState<UserUsageStatus | null>(initialUsage || null);
  const [loading, setLoading] = React.useState(!initialUsage);

  const fetchUsage = React.useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.error("Failed to fetch usage:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialUsage) {
      fetchUsage();
    }

    // Listen for custom usage update events triggered by AI services
    const handleUsageUpdated = (event: CustomEvent<UserUsageStatus>) => {
      if (event.detail) {
        setUsage(event.detail);
      } else {
        fetchUsage();
      }
    };

    window.addEventListener("mailpilot:usage-updated" as any, handleUsageUpdated);
    return () => {
      window.removeEventListener("mailpilot:usage-updated" as any, handleUsageUpdated);
    };
  }, [initialUsage, fetchUsage]);

  if (loading || !usage) {
    return (
      <div className={cn("inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground animate-pulse", className)}>
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Loading daily limit...</span>
      </div>
    );
  }

  const isExhausted = usage.remainingToday === 0;
  const isLow = usage.remainingToday <= 3 && usage.remainingToday > 0;

  return (
    <div
      title={
        isExhausted
          ? "You've used all 10 AI generations for today. Your limit will reset tomorrow."
          : `${usage.remainingToday} of ${usage.dailyLimit} free generations remaining today`
      }
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all shadow-sm",
        isExhausted
          ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          : isLow
          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-primary/30 bg-primary/10 text-primary dark:text-blue-400",
        className
      )}
    >
      {isExhausted ? (
        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
      ) : (
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
      )}
      <span className="font-semibold">
        {usage.remainingToday} / {usage.dailyLimit}
      </span>
      <span className="hidden sm:inline text-muted-foreground font-normal">
        {isExhausted ? "used today (resets tomorrow)" : "generations remaining today"}
      </span>
      <span className="sm:hidden text-muted-foreground font-normal">
        left
      </span>
    </div>
  );
}
