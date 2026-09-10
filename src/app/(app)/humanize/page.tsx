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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Humanize Email</h2>
            <p className="text-xs text-muted-foreground">Make AI-generated or stiff corporate emails sound natural, warm, and human.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card/95">
        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Paste AI-generated or formal email
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="e.g. 'I hope this email finds you well. As per our previous discourse, pursuant to our organizational objectives...'"
              className="min-h-[140px] text-sm p-4 rounded-2xl bg-muted/30 focus:bg-background border-border"
            />
          </div>

          {/* Humanization Level */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Humanization Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-sm font-bold text-foreground">{lvl.label}</span>
                    <span className="text-[11px] text-muted-foreground">{lvl.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleHumanize}
              disabled={loading || !inputEmail.trim()}
              className="gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-rose-500/25 bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Heart className="h-4 w-4" />
              <span>{loading ? "Humanizing..." : "Humanize Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Humanized Version</span>
                </span>
                <Badge variant="outline" className="capitalize text-xs">
                  {level} Level
                </Badge>
              </div>

              {isEditing ? (
                <Textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="min-h-[180px] text-sm font-mono leading-relaxed p-4 rounded-xl bg-muted/20"
                />
              ) : (
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {editableBody || output.humanizedText}
                </div>
              )}

              {/* Adjustments summary */}
              {output.adjustmentsSummary && output.adjustmentsSummary.length > 0 && (
                <div className="bg-rose-500/5 rounded-xl p-3 border border-rose-500/20 text-xs text-muted-foreground">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">
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
