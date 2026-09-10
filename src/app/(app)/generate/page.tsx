"use client";

import * as React from "react";
import { Mail, Sparkles, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipientToneSelector } from "@/components/email/RecipientToneSelector";
import { OutputActions } from "@/components/email/OutputActions";
import { QuickRewriteBar } from "@/components/email/QuickRewriteBar";
import { useToast } from "@/components/ui/toast";
import { ImageDropzone } from "@/components/email/ImageDropzone";
import type { LengthType, EmailGenerationOutput, ImageDataInput } from "@/types";

export default function GeneratePage() {
  const { success, error } = useToast();
  const [prompt, setPrompt] = React.useState("");
  const [images, setImages] = React.useState<ImageDataInput[]>([]);
  const [recipient, setRecipient] = React.useState("Manager");
  const [tone, setTone] = React.useState("professional");
  const [length, setLength] = React.useState<LengthType>("medium");
  const [useOrgTone, setUseOrgTone] = React.useState(false);
  const [customTones, setCustomTones] = React.useState<any[]>([]);
  const [userOrgs, setUserOrgs] = React.useState<any[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<EmailGenerationOutput | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/tones")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCustomTones(data);
        const def = data.find((t: any) => t.isDefault);
        if (def) setTone(`custom:${def.id}`);
      })
      .catch(() => {});

    fetch("/api/organizations")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setUserOrgs(data))
      .catch(() => {});
  }, []);

  const handleGenerate = async (customInstructionsOverride?: string) => {
    if (!prompt.trim() && images.length === 0) {
      error("Please describe what you want to write or upload an image/screenshot!");
      return;
    }

    setLoading(true);
    try {
      let selectedCustomToneInstr: string | undefined;
      let actualTone = tone;
      if (tone.startsWith("custom:")) {
        const toneId = tone.replace("custom:", "");
        const matched = customTones.find((t) => t.id === toneId);
        if (matched) {
          selectedCustomToneInstr = matched.instructions;
          actualTone = matched.name;
        }
      }

      const activeOrg = useOrgTone && userOrgs.length > 0 ? userOrgs[0].id : undefined;

      const res = await fetch("/api/email/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          recipient,
          tone: actualTone,
          length,
          customToneInstructions: selectedCustomToneInstr,
          organizationId: activeOrg,
          additionalInstructions: customInstructionsOverride,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate email");
      }

      setOutput(data.data);
      setEditableBody(data.data.body);
      setIsEditing(false);
      success("Email generated!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRewrite = async (rewriteType: string) => {
    if (!output) return;
    let instructions = `Rewrite to be ${rewriteType}.`;
    if (rewriteType === "humanize") {
      instructions = "Make this email sound exceptionally natural and human without corporate speak.";
    }
    await handleGenerate(instructions);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Email Generator</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Enter key points or upload a screenshot/image to compose a complete email.</p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              What do you want to say?
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Schedule a 30 min sync with the marketing team on Thursday to review our Q4 campaign results..."
              className="min-h-[110px] text-sm p-3 rounded-lg bg-background border border-input focus:border-ring"
            />
          </div>

          {/* Multimodal Screenshot / Image Dropzone */}
          <ImageDropzone
            images={images}
            setImages={setImages}
            label="Attach Image or Screenshot (Optional)"
            placeholder="Drop, browse, or paste image (Ctrl+V) — invoice, notes, message screenshot"
          />

          <RecipientToneSelector
            recipient={recipient}
            setRecipient={setRecipient}
            tone={tone}
            setTone={setTone}
            length={length}
            setLength={setLength}
            customTones={customTones}
            orgContext={userOrgs.length > 0 ? userOrgs[0] : null}
            useOrgTone={useOrgTone}
            setUseOrgTone={setUseOrgTone}
          />

          <div className="flex items-center justify-end pt-1">
            <Button
              size="sm"
              onClick={() => handleGenerate()}
              disabled={loading || (!prompt.trim() && images.length === 0)}
              className="h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? "Writing email..." : "Generate Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Subject</span>
                  <span className="text-sm font-semibold text-foreground">{output.subject}</span>
                </div>
                <Badge variant="outline" className="capitalize text-[11px] font-medium">
                  {output.tone}
                </Badge>
              </div>

              {isEditing ? (
                <Textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="min-h-[180px] text-xs font-mono leading-relaxed p-3.5 rounded-lg bg-background border border-input"
                />
              ) : (
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-foreground font-normal">
                  {editableBody || output.body}
                </div>
              )}

              <QuickRewriteBar onRewrite={handleQuickRewrite} disabled={loading} />
            </div>

            <OutputActions
              subject={output.subject}
              body={editableBody || output.body}
              originalPrompt={prompt}
              recipient={recipient}
              tone={tone}
              category="GENERATED"
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onRegenerate={() => handleGenerate()}
              onClear={() => setOutput(null)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
