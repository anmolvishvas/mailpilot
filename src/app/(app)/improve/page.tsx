"use client";

import * as React from "react";
import { Wand2, Sparkles, Shield, Smile, Minimize2, Flame, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiffViewer } from "@/components/email/DiffViewer";
import { OutputActions } from "@/components/email/OutputActions";
import { useToast } from "@/components/ui/toast";
import type { EmailImprovementOutput } from "@/types";

export default function ImprovePage() {
  const { success, error } = useToast();

  const [inputEmail, setInputEmail] = React.useState("");
  const [desiredTone, setDesiredTone] = React.useState<"professional" | "friendly" | "concise" | "assertive" | "humanize">("professional");
  const [customInstructions, setCustomInstructions] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<EmailImprovementOutput | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const handleImprove = async (toneOverride?: any) => {
    if (!inputEmail.trim()) {
      error("Please paste the email you want to improve!");
      return;
    }

    const targetTone = toneOverride || desiredTone;

    setLoading(true);
    try {
      const res = await fetch("/api/email/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailToImprove: inputEmail.trim(),
          desiredTone: targetTone,
          customInstructions: customInstructions.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to improve email");
      }

      setOutput(data.data);
      setEditableBody(data.data.improved);
      setIsEditing(false);
      success("Email improved successfully!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to improve email");
    } finally {
      setLoading(false);
    }
  };

  const tones = [
    { id: "professional", label: "Professional", icon: Shield, desc: "Polished corporate tone" },
    { id: "friendly", label: "Friendly", icon: Smile, desc: "Warm and personable" },
    { id: "concise", label: "Concise", icon: Minimize2, desc: "Short and straight to the point" },
    { id: "assertive", label: "Assertive", desc: "Firm and direct" },
    { id: "humanize", label: "Humanize", icon: Bot, desc: "Natural conversational language" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Improve Email</h2>
            <p className="text-xs text-muted-foreground">Transform rough drafts into clear, articulate, professional communication.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card/95">
        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Paste your email draft
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="e.g. 'hi sir i am waiting for payment from long time please pay fast'"
              className="min-h-[140px] text-sm p-4 rounded-2xl bg-muted/30 focus:bg-background border-border"
            />
          </div>

          {/* Tone Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Enhancement Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {tones.map((t) => {
                const isSelected = desiredTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDesiredTone(t.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={() => handleImprove()}
              disabled={loading || !inputEmail.trim()}
              className="gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Wand2 className="h-4 w-4" />
              <span>{loading ? "Polishing email..." : "Improve Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card p-6 sm:p-8 flex flex-col gap-6">
            <DiffViewer
              original={output.original}
              improved={editableBody || output.improved}
              changesSummary={output.changesSummary}
              readabilityScore={output.readabilityScore}
            />

            <OutputActions
              subject={output.subject || "Improved Email"}
              body={editableBody || output.improved}
              originalPrompt={inputEmail}
              category="IMPROVED"
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onRegenerate={() => handleImprove()}
              onClear={() => setOutput(null)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
