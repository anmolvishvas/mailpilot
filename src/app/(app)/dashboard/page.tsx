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
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {greeting}, {userName}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            What would you like to communicate today?
          </p>
        </div>

        {/* Quick feature links */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link href="/reply">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 rounded-lg font-normal">
              <Send className="h-3 w-3" />
              <span>Reply</span>
            </Button>
          </Link>
          <Link href="/improve">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 rounded-lg font-normal">
              <Wand2 className="h-3 w-3" />
              <span>Improve</span>
            </Button>
          </Link>
          <Link href="/analyze">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 rounded-lg font-normal">
              <BarChart3 className="h-3 w-3" />
              <span>Analyze</span>
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 rounded-lg font-normal">
              <FileText className="h-3 w-3" />
              <span>Templates</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Studio Card */}
      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Compose Email</CardTitle>
            <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded font-medium">
              Free Studio
            </span>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your key points or thoughts below. MailPilot will format and polish it.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 flex flex-col gap-4">
          {/* Main Prompt Textarea */}
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Request leave for tomorrow due to family function, will finish pending tasks today"
              className="min-h-[120px] text-sm leading-relaxed p-3.5 rounded-lg bg-background border border-input focus:border-ring"
            />
            {prompt.length > 0 && (
              <button
                onClick={() => setPrompt("")}
                className="absolute right-2.5 top-2.5 text-[11px] text-muted-foreground hover:text-foreground bg-secondary px-2 py-0.5 rounded"
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
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Generates a clean, professional email tailored for your recipient.
            </p>
            <Button
              size="sm"
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="w-full sm:w-auto h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? "Writing email..." : "Generate Email"}</span>
            </Button>
          </div>
        </CardContent>

        {/* Output Section */}
        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-5 flex flex-col gap-3">
              {/* Output Header */}
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Subject
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {output.subject}
                  </span>
                </div>
                <Badge variant="outline" className="text-[11px] font-medium capitalize">
                  {output.tone}
                </Badge>
              </div>

              {/* Output Body */}
              {isEditing ? (
                <Textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="min-h-[180px] text-xs leading-relaxed p-3.5 rounded-lg font-mono bg-background border border-input"
                />
              ) : (
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-foreground font-normal">
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
