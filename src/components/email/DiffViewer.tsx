"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";

interface DiffViewerProps {
  original: string;
  improved: string;
  changesSummary?: string[];
  readabilityScore?: string;
}

export function DiffViewer({
  original,
  improved,
  changesSummary = [],
  readabilityScore,
}: DiffViewerProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 p-3 text-xs border border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Enhancement Metrics:</span>
          {readabilityScore && (
            <Badge variant="success" className="text-[11px]">
              {readabilityScore}
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground">
          Original: {original.split(/\s+/).length} words → Improved: {improved.split(/\s+/).length} words
        </div>
      </div>

      {/* Changes Summary Pill List */}
      {changesSummary.length > 0 && (
        <div className="flex flex-col gap-1.5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Key Improvements Applied:
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {changesSummary.map((change, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <div className="flex flex-col rounded-xl border border-border/80 bg-background/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Original Draft
            </span>
            <Badge variant="secondary" className="text-[10px]">
              Raw
            </Badge>
          </div>
          <div className="p-4 text-sm whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
            {original}
          </div>
        </div>

        {/* Improved */}
        <div className="flex flex-col rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Polished & Improved
            </span>
            <Badge variant="default" className="text-[10px]">
              Enhanced
            </Badge>
          </div>
          <div className="p-4 text-sm whitespace-pre-wrap font-sans text-foreground leading-relaxed font-medium">
            {improved}
          </div>
        </div>
      </div>
    </div>
  );
}
