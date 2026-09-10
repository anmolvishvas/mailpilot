"use client";

import * as React from "react";
import { Bot, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutputActions } from "@/components/email/OutputActions";
import { useToast } from "@/components/ui/toast";
import type { HumanizeLevel, HumanizeOutput } from "@/types";

export default function HumanizePage() {
  const { success, error } = useToast();

  const [inputEmail, setInputEmail] = React.useState("");
  const [level, setLevel] = React.useState<HumanizeLevel>("natural");
  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<HumanizeOutput | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const handleHumanize = async () => {
    if (!inputEmail.trim()) {
      error("Please paste an email to humanize!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/email/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inputEmail.trim(),
          level,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to humanize email");
      }

      setOutput(data.data);
      setEditableBody(data.data.humanizedText);
      setIsEditing(false);
      success("Email humanized successfully!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to humanize email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Humanize Email</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Remove stiff corporate clichés and make emails sound natural and clear.</p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Formal or AI-Generated Draft
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Paste email to humanize..."
              className="min-h-[120px] text-sm p-3 rounded-lg bg-background border border-input focus:border-ring"
            />
          </div>

          {/* Humanization Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Humanization Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: "light", label: "Light", desc: "Gentle cleanup of stiff phrases" },
                { id: "natural", label: "Natural", desc: "Balanced warm conversational style" },
                { id: "strong", label: "Strong", desc: "Completely relaxed and organic" },
              ].map((lvl) => {
                const isSelected = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setLevel(lvl.id as HumanizeLevel)}
                    className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? "border-foreground bg-foreground text-background font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span className="text-xs font-semibold">{lvl.label}</span>
                    <span className={`text-[11px] ${isSelected ? "text-background/80" : "text-muted-foreground"}`}>{lvl.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleHumanize}
              disabled={loading || !inputEmail.trim()}
              className="h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>{loading ? "Humanizing..." : "Humanize Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Humanized Output
                </span>
                <Badge variant="outline" className="capitalize text-[11px] font-medium">
                  {level} Level
                </Badge>
              </div>

              {isEditing ? (
                <Textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="min-h-[180px] text-xs font-mono leading-relaxed p-3.5 rounded-lg bg-background border border-input"
                />
              ) : (
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-normal">
                  {editableBody || output.humanizedText}
                </div>
              )}

              {/* Adjustments summary */}
              {output.adjustmentsSummary && output.adjustmentsSummary.length > 0 && (
                <div className="bg-secondary/30 rounded-lg p-3 border border-border text-xs text-muted-foreground">
                  <span className="font-medium text-foreground block mb-1">
                    Adjustments applied:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {output.adjustmentsSummary.map((adj, idx) => (
                      <li key={idx}>{adj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <OutputActions
              subject="Humanized Email"
              body={editableBody || output.humanizedText}
              originalPrompt={inputEmail}
              category="HUMANIZE"
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onRegenerate={() => handleHumanize()}
              onClear={() => setOutput(null)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
