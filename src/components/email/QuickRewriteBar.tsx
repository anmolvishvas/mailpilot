"use client";

import * as React from "react";
import { Sparkles, Wand2, ArrowDown, ArrowUp, Smile, Shield, Flame, HeartHandshake, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickRewriteBarProps {
  onRewrite: (type: string) => void;
  disabled?: boolean;
}

const rewriteOptions = [
  { id: "professional", label: "More professional", icon: Shield },
  { id: "friendly", label: "Friendlier", icon: Smile },
  { id: "shorter", label: "Shorter", icon: ArrowDown },
  { id: "longer", label: "Longer", icon: ArrowUp },
  { id: "confident", label: "More confident", icon: Flame },
  { id: "polite", label: "More polite", icon: HeartHandshake },
  { id: "assertive", label: "More assertive", icon: Shield },
  { id: "humanize", label: "Humanize", icon: Bot },
];

export function QuickRewriteBar({ onRewrite, disabled }: QuickRewriteBarProps) {
  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-border/60">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Wand2 className="h-3.5 w-3.5 text-primary" />
        <span>Quick Rewrites</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {rewriteOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <Button
              key={opt.id}
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onRewrite(opt.id)}
              className="h-8 shrink-0 gap-1.5 rounded-full text-xs font-medium hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
            >
              <Icon className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
              <span>{opt.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
