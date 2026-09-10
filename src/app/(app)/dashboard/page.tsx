"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Wand2,
  BarChart3,
  Bot,
  Languages,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecipientToneSelector } from "@/components/email/RecipientToneSelector";
import { OutputActions } from "@/components/email/OutputActions";
import { QuickRewriteBar } from "@/components/email/QuickRewriteBar";
import { useToast } from "@/components/ui/toast";
import type { LengthType, EmailGenerationOutput } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { success, error } = useToast();

  const [prompt, setPrompt] = React.useState("");
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

  // Time-aware greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const userName = session?.user?.name || "there";

  // Load custom tones and organizations
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
    if (!prompt.trim()) {
      error("Please tell MailPilot what you want to say!");
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate email");
      }

      setOutput(data.data);
      setEditableBody(data.data.body);
      setIsEditing(false);
      success("Email generated successfully!");

      // Dispatch event to update usage pill live
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
    let instructions = "";
    if (rewriteType === "professional") instructions = "Rewrite to be significantly more formal and professional.";
    else if (rewriteType === "friendly") instructions = "Rewrite to be warm, friendly, and approachable.";
    else if (rewriteType === "shorter") instructions = "Make this email much more concise and punchy.";
    else if (rewriteType === "longer") instructions = "Expand this email with more detailed explanations and context.";
    else if (rewriteType === "confident") instructions = "Rewrite with strong confidence and authoritative tone.";
    else if (rewriteType === "polite") instructions = "Make the email exceptionally polite, respectful, and considerate.";
    else if (rewriteType === "assertive") instructions = "Rewrite to be direct, assertive, and unambiguous.";
    else if (rewriteType === "humanize") instructions = "Remove all robotic clichés and make this sound like natural, warm human communication.";

    await handleGenerate(instructions);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {greeting}, {userName} 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            What would you like to write today?
          </p>
        </div>

        {/* Quick feature links */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/reply">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
              <Send className="h-3.5 w-3.5 text-indigo-500" />
              <span>Reply</span>
            </Button>
          </Link>
          <Link href="/improve">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
              <Wand2 className="h-3.5 w-3.5 text-amber-500" />
              <span>Improve</span>
            </Button>
          </Link>
          <Link href="/analyze">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Analyze</span>
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs">
              <FileText className="h-3.5 w-3.5 text-purple-500" />
              <span>Templates</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Studio Card */}
      <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card/95">
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-xl font-bold">What do you want to say?</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              100% Free
            </Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            Type your message roughly, with typos or broken English — MailPilot will format and polish it.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 pt-0 flex flex-col gap-6">
          {/* Main Prompt Textarea */}
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: sir i need leave tomorrow because family function in my home town"
              className="min-h-[140px] text-base leading-relaxed p-4 rounded-2xl bg-muted/30 focus:bg-background border-border"
            />
            {prompt.length > 0 && (
              <button
                onClick={() => setPrompt("")}
                className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground bg-muted/60 px-2 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Recipient, Tone, Length */}
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

          {/* Primary Generate CTA */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Press generate to craft a tailored, human-sounding email.
            </p>
            <Button
              size="lg"
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="w-full sm:w-auto gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? "Writing your email..." : "✨ Generate Email"}</span>
            </Button>
          </div>
        </CardContent>

        {/* Output Section */}
        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              {/* Output Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generated Email</span>
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Subject: {output.subject}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs font-semibold capitalize">
                  {output.tone} Tone
                </Badge>
              </div>

              {/* Output Body */}
              {isEditing ? (
                <Textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="min-h-[200px] text-sm leading-relaxed p-4 rounded-xl font-mono bg-muted/20"
                />
              ) : (
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 text-sm sm:text-base whitespace-pre-wrap leading-relaxed text-foreground font-medium selection:bg-primary/20">
                  {editableBody || output.body}
                </div>
              )}

              {/* Quick Rewrite Bar */}
              <QuickRewriteBar
                onRewrite={handleQuickRewrite}
                disabled={loading}
              />
            </div>

            {/* Output Actions (Copy, Edit, Save, Regenerate, Download) */}
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
