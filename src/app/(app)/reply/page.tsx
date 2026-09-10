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
import type { LengthType, EmailGenerationOutput } from "@/types";
import { standardTones, lengths } from "@/components/email/RecipientToneSelector";

export default function ReplyPage() {
  const { success, error } = useToast();

  const [receivedEmail, setReceivedEmail] = React.useState("");
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
    if (!receivedEmail.trim()) {
      error("Please paste the email you received!");
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Reply Generator</h2>
            <p className="text-xs text-muted-foreground">Paste any incoming email and let MailPilot craft the contextual response.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card/95">
        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Step 1: Received Email */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Paste the email you received</span>
              <span className="text-[11px] font-normal text-muted-foreground">Required</span>
            </label>
            <Textarea
              value={receivedEmail}
              onChange={(e) => setReceivedEmail(e.target.value)}
              placeholder="Paste the received email here... e.g. 'Hi Alex, can we move tomorrow's sprint demo to Monday 2 PM instead?'"
              className="min-h-[130px] text-sm p-4 rounded-2xl bg-muted/30 focus:bg-background border-border"
            />
          </div>

          {/* Step 2: What do you want to say? */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>What do you want to say? (Your intent)</span>
              <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
            </label>
            <Input
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              placeholder="e.g. Yes, Monday works for me / No, suggest Tuesday instead"
              className="rounded-xl h-11"
            />
          </div>

          {/* Quick Intent Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Quick Intent Presets:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickIntent("Accept and confirm the proposed plan")}
                className="gap-1.5 rounded-full text-xs hover:border-emerald-500/50 hover:text-emerald-600"
              >
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>Accept</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickIntent("Politely decline due to a scheduling conflict")}
                className="gap-1.5 rounded-full text-xs hover:border-rose-500/50 hover:text-rose-600"
              >
                <ThumbsDown className="h-3.5 w-3.5 text-rose-500" />
                <span>Decline</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickIntent("Suggest another day or alternate time slot")}
                className="gap-1.5 rounded-full text-xs hover:border-blue-500/50 hover:text-blue-600"
              >
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span>Suggest Another Time</span>
              </Button>
            </div>
          </div>

          {/* Tone & Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {standardTones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthType)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
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
          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={() => handleGenerateReply()}
              disabled={loading || !receivedEmail.trim()}
              className="gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? "Drafting Reply..." : "Generate Reply"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Drafted Reply
                  </span>
                  <span className="text-sm font-bold text-foreground">{output.subject}</span>
                </div>
                <Badge variant="outline" className="capitalize text-xs">
                  {output.tone}
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
