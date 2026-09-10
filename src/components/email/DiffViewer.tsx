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
  const [mobileView, setMobileView] = React.useState<"improved" | "original" | "split">("improved");

  return (
    <div className="flex flex-col gap-3">
      {/* Metrics Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/40 p-2.5 text-xs border border-border">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">Enhancement Metrics:</span>
          {readabilityScore && (
            <span className="text-[11px] font-medium bg-secondary px-2 py-0.5 rounded border border-border">
              {readabilityScore}
            </span>
          )}
        </div>
        <div className="text-muted-foreground text-[11px]">
          {original.split(/\s+/).filter(Boolean).length} words → {improved.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      {/* Changes Summary Pill List */}
      {changesSummary.length > 0 && (
        <div className="flex flex-col gap-1.5 bg-secondary/20 border border-border rounded-lg p-3">
          <span className="text-xs font-medium text-foreground">
            Changes Applied:
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {changesSummary.map((change, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0 mt-0.5" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mobile View Toggle (visible only on small screens) */}
      <div className="flex lg:hidden items-center justify-center p-0.5 rounded-lg bg-secondary border border-border text-xs font-medium">
        <button
          type="button"
          onClick={() => setMobileView("improved")}
          className={`flex-1 py-1 px-2 rounded-md text-center transition-colors ${
            mobileView === "improved"
              ? "bg-background text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Polished
        </button>
        <button
          type="button"
          onClick={() => setMobileView("original")}
          className={`flex-1 py-1 px-2 rounded-md text-center transition-colors ${
            mobileView === "original"
              ? "bg-background text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => setMobileView("split")}
          className={`flex-1 py-1 px-2 rounded-md text-center transition-colors ${
            mobileView === "split"
              ? "bg-background text-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Side-by-Side
        </button>
      </div>

      {/* Comparison Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Original Draft */}
        <div
          className={`flex flex-col rounded-lg border border-border bg-background overflow-hidden ${
            mobileView === "improved" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-3.5 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Original Draft
            </span>
          </div>
          <div className="p-3.5 text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
            {original}
          </div>
        </div>

        {/* Improved Output */}
        <div
          className={`flex flex-col rounded-lg border border-border bg-secondary/20 overflow-hidden ${
            mobileView === "original" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3.5 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-foreground">
              Polished Output
            </span>
          </div>
          <div className="p-3.5 text-xs whitespace-pre-wrap text-foreground leading-relaxed">
            {improved}
          </div>
        </div>
      </div>
    </div>
  );
}
