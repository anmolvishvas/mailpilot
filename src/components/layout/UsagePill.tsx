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
      <div className={cn("inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground", className)}>
        <Sparkles className="h-3 w-3 text-muted-foreground" />
        <span>Loading...</span>
      </div>
    );
  }

  const isExhausted = usage.remainingToday === 0;
  const isLow = usage.remainingToday <= 3 && usage.remainingToday > 0;

  return (
    <div
      title={
        isExhausted
          ? "Daily limit reached (10/10). Resets tomorrow."
          : `${usage.remainingToday} of ${usage.dailyLimit} generations remaining today`
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        isExhausted
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : isLow
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-secondary text-foreground",
        className
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        isExhausted ? "bg-destructive" : isLow ? "bg-amber-500" : "bg-emerald-500"
      )} />
      <span>
        {usage.remainingToday}/{usage.dailyLimit}
      </span>
      <span className="hidden sm:inline text-muted-foreground font-normal text-[11px]">
        left today
      </span>
    </div>
  );
}
