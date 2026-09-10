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
  Globe,
  HeartHandshake,
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

I wanted to request leave for tomorrow as I have a family function to attend.

I'll make sure any pending work is taken care of beforehand, and I will be reachable if anything urgent comes up.

Thank you for understanding.

Best,
[Your Name]`,
    },
    reply: {
      input: "Received: 'Hi Anmol, can we move tomorrow's meeting to Monday?'\nIntent: 'Yes, Monday works for me.'",
      subject: "Re: Meeting Reschedule Confirmation",
      body: `Hi [Sender Name],

Thanks for checking in.

Yes, Monday works perfectly for me. Let's lock in the time and sync then.

Looking forward to it!

Best regards,
[Your Name]`,
    },
    improve: {
      input: "hi sir i am waiting for payment from long time please pay fast",
      subject: "Polite Follow-up: Pending Invoice Payment",
      body: `Dear [Client Name],

I hope this email finds you having a productive week.

I am writing to politely follow up regarding the outstanding payment for invoice [Invoice Number], which was due on [Due Date].

Could you please confirm the expected payment schedule with your finance team?

Thank you for your prompt assistance.

Warm regards,
[Your Name]`,
    },
    analyze: {
      input: "Please review the attached contract by Friday 5 PM. We need your signed approval before we can release the $15,000 project budget.",
      subject: "Analysis: Contract Review & Budget Release",
      body: `• Tone: Professional & Time-Sensitive
• Urgency: High (Deadline: This Friday, 5 PM)
• Intent: Contract sign-off required for budget release ($15,000)
• Action Required: Yes (Review and return signed document)
• Summary: The sender is waiting on your signed approval by Friday 5 PM to proceed with project funding.`,
    },
    humanize: {
      input: "I hope this email finds you well. As per our previous discourse, pursuant to our organizational objectives, we ought to synergize.",
      subject: "Natural Human Tone",
      body: `Hi team,

Following up on our earlier chat — wanted to make sure we're aligned on the next steps for our project.

Let me know what you think and if you need anything from my side.

Cheers,
[Your Name]`,
    },
    translate: {
      input: "I will be out of the office next week. Please contact David for urgent matters.",
      subject: "Traducción (Spanish / Español)",
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
      {/* Top Banner: 100% Free Promise */}
      <div className="bg-gradient-to-r from-primary/90 via-blue-600 to-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>MailPilot is 100% Free. No credit cards. No subscriptions. 10 free AI generations every day for everyone!</span>
        </span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 md:px-8 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-400 text-white shadow-md shadow-primary/25">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">MailPilot</span>
            <span className="text-[10px] text-muted-foreground font-medium">Free AI Email Assistant</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Interactive Demo</a>
          <a href="#free-promise" className="hover:text-foreground transition-colors">Why Free?</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="rounded-xl font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="rounded-xl font-semibold shadow-md shadow-primary/20">
              Start Writing — It's Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 gradient-hero">
        <div className="container mx-auto px-4 max-w-5xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-in fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The AI Email Assistant For Everyone</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
            Write better emails. <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              In seconds.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Tell MailPilot what you want to say. Our AI turns it into a clear, natural, professional email.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center max-w-md">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40">
                <span>Start Writing — It's Free</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl">
                See Live Demo
              </Button>
            </a>
          </div>

          {/* Quick trust highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/60 max-w-3xl w-full text-xs text-muted-foreground font-medium">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>10 Free AI Generations / Day</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Free Team Collaboration</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Zero Fake AI Clichés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Studio Demo Section */}
      <section id="demo" className="py-16 md:py-24 bg-muted/30 border-y border-border/60">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="info" className="mb-2">
              Interactive Preview
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Experience the power of MailPilot
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Select a capability below to see how MailPilot transforms messy thoughts into flawless emails.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
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
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Mock Card */}
          <div className="mt-4 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: Input */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your Rough Thought / Input
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    Zero Prompting Required
                  </Badge>
                </div>
                <div className="rounded-2xl border border-input bg-muted/30 p-4 font-mono text-sm text-foreground min-h-[140px] whitespace-pre-wrap leading-relaxed">
                  {sampleOutputs[activeTab].input}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>MailPilot understands context even with spelling mistakes or broken grammar.</span>
                </div>
              </div>

              {/* Right: AI Output */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>MailPilot Generated Output</span>
                  </span>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs gap-1 rounded-lg">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-4 sm:p-5 flex flex-col gap-2 min-h-[140px]">
                  <div className="text-xs font-bold text-foreground border-b border-primary/20 pb-2">
                    Subject: {sampleOutputs[activeTab].subject}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {sampleOutputs[activeTab].body}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                Try it yourself with your own emails — completely free!
              </div>
              <Link href="/register">
                <Button size="sm" className="gap-2 rounded-xl font-semibold">
                  <span>Open Free Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* "Everything is free." Section */}
      <section id="free-promise" className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              100% Free Forever
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Everything is free.
            </h2>

            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              10 AI generations every day. Every feature included. No subscriptions. No credit card.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Paywalls</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Every user gets full access to all 35+ templates, custom tones, humanization, translation, and team workspaces.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-base">10 Daily Generations</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Generous 10 successful generations every 24 hours. Failed requests never consume your quota.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-3">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-foreground text-base">Free Teams & Orgs</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Create organizations, share company templates, enforce brand voice, and view aggregate usage analytics for free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20 bg-muted/20 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Built for every email you'll ever send
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Powerful specialized AI tools designed to streamline your daily communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Generate */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-primary mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">AI Email Generator</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Describe what you want to say in simple bullet points or raw sentences. MailPilot constructs a complete professional email.
              </p>
            </div>

            {/* 2. Reply */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 mb-4">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Contextual Reply Generator</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Paste any email you received and state your intent (e.g. "Yes, Monday works"). MailPilot drafts the ideal response.
              </p>
            </div>

            {/* 3. Improve */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-4">
                <Wand2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Email Improver</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Turn rushed or unclear drafts into polished, high-impact messages while preserving all facts, numbers, and dates.
              </p>
            </div>

            {/* 4. Analyze */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Email Analysis</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Instantly extract tone, sentiment, urgency level, action items, dates, and deadlines, plus 1-click reply generation.
              </p>
            </div>

            {/* 5. Humanize */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 mb-4">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Email Humanizer</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Strip out stiff robotic corporate clichés and make your emails sound natural, conversational, and authentic.
              </p>
            </div>

            {/* 6. Translate */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 mb-4">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Tone-Preserving Translation</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Translate across 11 languages (English, Hindi, Gujarati, Spanish, French, German, and more) while maintaining natural tone.
              </p>
            </div>

            {/* 7. Custom Tones */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 mb-4">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Custom Writing Tones</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Create personalized writing profiles (e.g. "Executive Brief", "Client Support") to match your exact voice.
              </p>
            </div>

            {/* 8. Teams */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Organizations & Teams</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Collaborate with shared templates, company writing voice, role-based controls, and team analytics.
              </p>
            </div>

            {/* 9. 35+ Templates */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">35+ Built-In Templates</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Work, Business, Education, Personal, and Official templates ready to fill and send in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works in 30 seconds */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Badge variant="secondary" className="mb-2">
            Effortless Workflow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-12">
            Write great emails in under 30 seconds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div className="flex flex-col gap-3 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg shadow-lg shadow-primary/25">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Describe your thought</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type what you want to communicate in your own words. No prompt engineering needed.
              </p>
            </div>

            <div className="flex flex-col gap-3 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg shadow-lg shadow-primary/25">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Select recipient & tone</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose who it's for (Manager, Client, HR, etc.) and your desired tone (Professional, Friendly, Concise).
              </p>
            </div>

            <div className="flex flex-col gap-3 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-lg shadow-lg shadow-primary/25">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Copy & send</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review your email, apply quick rewrites if desired, and copy directly to your email client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-t from-primary/10 to-background border-t border-border/60">
        <div className="container mx-auto px-4 max-w-3xl text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Ready to write better emails?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl">
            Join students, freelancers, managers, and teams writing clear, confident emails with MailPilot.
          </p>
          <Link href="/register">
            <Button size="lg" className="rounded-2xl px-8 font-bold text-base shadow-xl shadow-primary/25 gap-2">
              <span>Start Writing — It's Free</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 bg-card py-8 px-4 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
              M
            </div>
            <span className="font-semibold text-foreground">MailPilot</span>
            <span>— 100% Free AI Email Assistant</span>
          </div>
          <div>
            Tell MailPilot what you want to say. MailPilot writes the email.
          </div>
        </div>
      </footer>
    </div>
  );
}
