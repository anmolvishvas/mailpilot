"use client";

import * as React from "react";
import { Send, Sparkles, MessageSquare, Check, ThumbsUp, ThumbsDown, Clock, Shield, Smile, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutputActions } from "@/components/email/OutputActions";
import { QuickRewriteBar } from "@/components/email/QuickRewriteBar";
import { useToast } from "@/components/ui/toast";
import { ImageDropzone } from "@/components/email/ImageDropzone";
import type { LengthType, EmailGenerationOutput, ImageDataInput } from "@/types";
import { standardTones, lengths } from "@/components/email/RecipientToneSelector";

export default function ReplyPage() {
  const { success, error } = useToast();

  const [receivedEmail, setReceivedEmail] = React.useState("");
  const [images, setImages] = React.useState<ImageDataInput[]>([]);
  const [userIntent, setUserIntent] = React.useState("");
  const [tone, setTone] = React.useState("professional");
  const [length, setLength] = React.useState<LengthType>("medium");

  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<EmailGenerationOutput | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  // Check for context passed from /analyze
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("mailpilot:reply-context");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.receivedEmail) setReceivedEmail(parsed.receivedEmail);
        if (parsed.userIntent) setUserIntent(parsed.userIntent);
        sessionStorage.removeItem("mailpilot:reply-context");
      }
    } catch {}
  }, []);

  const handleGenerateReply = async (presetIntent?: string) => {
    if (!receivedEmail.trim() && images.length === 0) {
      error("Please paste the email or upload a screenshot of the message!");
      return;
    }

    const finalIntent = presetIntent || userIntent;

    setLoading(true);
    try {
      const res = await fetch("/api/email/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receivedEmail: receivedEmail.trim(),
          userIntent: finalIntent.trim() || undefined,
          tone,
          length,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reply");
      }

      setOutput(data.data);
      setEditableBody(data.data.body);
      setIsEditing(false);
      success("Reply generated successfully!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to generate reply");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickIntent = (intentText: string) => {
    setUserIntent(intentText);
    handleGenerateReply(intentText);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Reply Generator</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Paste an incoming message or upload a screenshot (Slack, WhatsApp, email) to craft a contextual reply.</p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          {/* Step 1: Received Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Received Email / Message</span>
              <span className="text-[10px] text-muted-foreground">Text or Screenshot</span>
            </label>
            <Textarea
              value={receivedEmail}
              onChange={(e) => setReceivedEmail(e.target.value)}
              placeholder="Paste the received message text here, or attach a screenshot below..."
              className="min-h-[100px] text-sm p-3 rounded-lg bg-background border border-input focus:border-ring"
            />
          </div>

          {/* Multimodal Screenshot / Image Dropzone */}
          <ImageDropzone
            images={images}
            setImages={setImages}
            label="Or Attach Screenshot / Image"
            placeholder="Drop, browse, or paste screenshot (Ctrl+V) — Slack, WhatsApp, email, ticket"
          />

          {/* Step 2: What do you want to say? */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Your Intent / Key Points</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </label>
            <Input
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="e.g. Confirm meeting on Monday / Politely decline due to schedule conflict"
              className="rounded-lg h-9 text-xs"
            />
          </div>

          {/* Quick Intent Chips */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickIntent("Accept and confirm the proposed plan")}
                className="h-7 text-xs gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className="h-3 w-3" />
                <span>Accept</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickIntent("Politely decline due to a scheduling conflict")}
                className="h-7 text-xs gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
              >
                <ThumbsDown className="h-3 w-3" />
                <span>Decline</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickIntent("Suggest another day or alternate time slot")}
                className="h-7 text-xs gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
              >
                <Clock className="h-3 w-3" />
                <span>Suggest Alternate Time</span>
              </Button>
            </div>
          </div>

          {/* Tone & Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus:ring-1 focus:ring-ring"
              >
                {standardTones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthType)}
                className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus:ring-1 focus:ring-ring"
              >
                {lengths.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={() => handleGenerateReply()}
              disabled={loading || (!receivedEmail.trim() && images.length === 0)}
              className="h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? "Drafting reply..." : "Generate Reply"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Drafted Reply
                  </span>
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
            </div>

            <OutputActions
              subject={output.subject}
              body={editableBody || output.body}
              originalPrompt={userIntent || "Reply to email"}
              tone={tone}
              category="REPLY"
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onRegenerate={() => handleGenerateReply()}
              onClear={() => setOutput(null)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
