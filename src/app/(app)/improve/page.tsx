"use client";

import * as React from "react";
import { Wand2, Sparkles, Shield, Smile, Minimize2, Flame, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiffViewer } from "@/components/email/DiffViewer";
import { OutputActions } from "@/components/email/OutputActions";
import { ImageDropzone } from "@/components/email/ImageDropzone";
import { useToast } from "@/components/ui/toast";
import type { EmailImprovementOutput, ImageDataInput } from "@/types";

export default function ImprovePage() {
  const { success, error } = useToast();

  const [inputEmail, setInputEmail] = React.useState("");
  const [images, setImages] = React.useState<ImageDataInput[]>([]);
  const [desiredTone, setDesiredTone] = React.useState<"professional" | "friendly" | "concise" | "assertive" | "humanize">("professional");
  const [customInstructions, setCustomInstructions] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<EmailImprovementOutput | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const handleImprove = async (toneOverride?: any) => {
    if (!inputEmail.trim() && images.length === 0) {
      error("Please paste the email or upload a screenshot/image to improve!");
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
          images: images.length > 0 ? images : undefined,
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
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Improve Email</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Transform rough drafts into clear, articulate, and professional communication.</p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Draft to Improve
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="e.g. 'hi sir i am waiting for payment from long time please pay fast'"
              className="min-h-[120px] text-sm p-3 rounded-lg bg-background border border-input focus:border-ring"
            />
          </div>

          {/* Multimodal Screenshot / Image Dropzone */}
          <ImageDropzone
            images={images}
            setImages={setImages}
            label="Or Attach Draft Screenshot / Image (Optional)"
            placeholder="Drop, browse, or paste image (Ctrl+V) of your draft or rough note"
          />

          {/* Tone Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Enhancement Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {tones.map((t) => {
                const isSelected = desiredTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDesiredTone(t.id as any)}
                    className={`flex items-center justify-center p-2 rounded-lg border text-center text-xs transition-colors ${
                      isSelected
                        ? "border-foreground bg-foreground text-background font-semibold"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={() => handleImprove()}
              disabled={loading || (!inputEmail.trim() && images.length === 0)}
              className="h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>{loading ? "Polishing email..." : "Improve Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card p-5 flex flex-col gap-4">
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
