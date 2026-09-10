"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Sparkles,
  Send,
  Wand2,
  BarChart3,
  Bot,
  Languages,
  Sliders,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState<"generate" | "reply" | "improve" | "analyze" | "humanize" | "translate">("generate");
  const [copied, setCopied] = React.useState(false);

  const sampleOutputs = {
    generate: {
      input: "sir i need leave tomorrow family function",
      subject: "Leave Request for Tomorrow - Family Function",
      body: `Hi [Manager Name],

I would like to request leave for tomorrow to attend a family function.

I will ensure any pending tasks are addressed beforehand, and I will remain reachable for any urgent matters.

Thank you for your understanding.

Best regards,
[Your Name]`,
    },
    reply: {
      input: "Received: 'Hi Anmol, can we move tomorrow's meeting to Monday?'\nIntent: 'Yes, Monday works for me.'",
      subject: "Re: Meeting Reschedule Confirmation",
      body: `Hi [Sender Name],

Thanks for reaching out.

Monday works well for me. Let's lock in the time and sync then.

Best regards,
[Your Name]`,
    },
    improve: {
      input: "hi sir i am waiting for payment from long time please pay fast",
      subject: "Polite Follow-up: Pending Invoice Payment",
      body: `Dear [Client Name],

I hope you are having a productive week.

I am writing to follow up regarding invoice [Invoice Number], which was due on [Due Date].

Could you please confirm the status with your finance team?

Thank you for your assistance.

Best regards,
[Your Name]`,
    },
    analyze: {
      input: "Please review the attached contract by Friday 5 PM. We need your signed approval before we can release the $15,000 project budget.",
      subject: "Analysis: Contract Review & Budget Release",
      body: `• Tone: Professional & Time-Sensitive
• Urgency: High (Deadline: Friday, 5:00 PM)
• Intent: Contract sign-off required for budget release ($15,000)
• Action Required: Yes (Review and return signed document)
• Summary: The sender is waiting on your signed approval by Friday 5 PM to proceed with funding.`,
    },
    humanize: {
      input: "I hope this email finds you well. As per our previous discourse, pursuant to our organizational objectives, we ought to synergize.",
      subject: "Natural Communication",
      body: `Hi team,

Following up on our earlier chat — wanted to make sure we're aligned on next steps.

Let me know what you think and if you need anything from my end.

Best,
[Your Name]`,
    },
    translate: {
      input: "I will be out of the office next week. Please contact David for urgent matters.",
      subject: "Spanish Translation",
      body: `Estimado/a [Nombre],

Estaré fuera de la oficina la próxima semana. Por favor, comuníquese con David para cualquier asunto urgente.

Saludos cordiales,
[Su Nombre]`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleOutputs[activeTab].body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Banner */}
      <div className="border-b border-border bg-secondary/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span>100% Free Forever • 10 Free AI Generations Daily • No Credit Card Required</span>
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 md:px-8 backdrop-blur">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
            <Mail className="h-4 w-4" />
          </div>
          <span className="text-sm sm:text-base font-semibold">MailPilot</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Preview</a>
          <a href="#free-promise" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="h-8 text-xs font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Clean, natural, professional emails in seconds</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.15] mb-5">
            Write better emails. <br />
            <span className="text-muted-foreground">Without the friction.</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed mb-8">
            Tell MailPilot what you want to communicate in your own words. Receive a clear, polished, and natural email ready to send.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center max-w-xs">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="default" className="w-full sm:w-auto gap-2 text-xs font-medium h-9 px-5">
                <span>Start Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button size="default" variant="outline" className="w-full sm:w-auto text-xs font-medium h-9 px-5">
                Live Preview
              </Button>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-6 border-t border-border max-w-3xl w-full text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0" />
              <span>10 Daily Free Runs</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0" />
              <span>Team Workspaces</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0" />
              <span>Zero Fluff</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Studio Demo Section */}
      <section id="demo" className="py-16 md:py-20 bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
              Interactive Preview
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Select a capability to see raw inputs transformed into concise emails.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-3">
            {[
              { id: "generate", label: "Generate", icon: Mail },
              { id: "reply", label: "Reply", icon: Send },
              { id: "improve", label: "Improve", icon: Wand2 },
              { id: "analyze", label: "Analyze", icon: BarChart3 },
              { id: "humanize", label: "Humanize", icon: Bot },
              { id: "translate", label: "Translate", icon: Languages },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-foreground text-background font-semibold"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Mock Card */}
          <div className="mt-3 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Left: Input */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Input Note / Draft
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    Raw text
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-3.5 font-mono text-xs text-foreground min-h-[130px] whitespace-pre-wrap leading-relaxed">
                  {sampleOutputs[activeTab].input}
                </div>
              </div>

              {/* Right: AI Output */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Generated Output</span>
                  </span>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="h-6 text-[11px] gap-1 px-2 rounded">
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
                <div className="rounded-lg border border-border bg-card p-3.5 flex flex-col gap-2 min-h-[130px]">
                  <div className="text-xs font-semibold text-foreground border-b border-border pb-1.5">
                    Subject: {sampleOutputs[activeTab].subject}
                  </div>
                  <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {sampleOutputs[activeTab].body}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                All 6 studio modes available on the free tier.
              </span>
              <Link href="/register">
                <Button size="sm" className="h-7 text-xs font-medium gap-1.5">
                  <span>Open Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Free Promise */}
      <section id="free-promise" className="py-16 md:py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Simple, transparent, and completely free.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              10 successful AI generations every day. Every feature unlocked. No trial periods or credit card requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground mb-3">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">No Paywalls</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Full access to all 35+ templates, tone profiles, improver, humanizer, and translation.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground mb-3">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">10 Daily Generations</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Daily quota resets every 24 hours. Failed requests never consume quota.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground mb-3">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Shared Workspaces</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Create teams, share templates, configure brand voice, and track workspace usage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-20 bg-secondary/20 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Core Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Tools specifically built for routine and executive email communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-foreground mb-3">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Email Generator</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Transform rough notes into structured, professional emails customized for your recipient and intent.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-foreground mb-3">
                <Send className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Reply Generator</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Paste incoming messages and provide your brief intent. Get ready-to-send contextual responses.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-foreground mb-3">
                <Wand2 className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Email Improver</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Polish wording and clarity while preserving all facts, dates, commitments, and recipient details.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-foreground mb-3">
                <BarChart3 className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Email Analysis</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Extract sentiment, urgency, deadlines, and action items with one-click reply drafting.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-foreground mb-3">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Humanizer</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Remove artificial phrasing and robotic buzzwords so your communication sounds authentic.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-foreground mb-3">
                <Languages className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Translation</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Translate across 11 languages while maintaining tone and natural phrasing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-10">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-semibold text-xs">
                1
              </div>
              <h3 className="text-xs font-semibold text-foreground">Describe your intent</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your key points or paste an email draft. No complex prompt engineering required.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-semibold text-xs">
                2
              </div>
              <h3 className="text-xs font-semibold text-foreground">Select tone & recipient</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose the recipient relation and desired communication style.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-semibold text-xs">
                3
              </div>
              <h3 className="text-xs font-semibold text-foreground">Review & copy</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review the generated output, make any minor adjustments, and copy directly to your client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 px-4 text-xs text-muted-foreground">
        <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-background font-semibold text-[10px]">
              M
            </div>
            <span className="font-semibold text-foreground">MailPilot</span>
            <span>— AI Email Assistant</span>
          </div>
          <div className="text-[11px]">
            Designed for clear, professional communication.
          </div>
        </div>
      </footer>
    </div>
  );
}
