"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  User,
  DollarSign,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmailAnalysisOutput } from "@/types";

interface AnalysisViewProps {
  analysis: EmailAnalysisOutput;
  originalEmail: string;
}

export function AnalysisView({ analysis, originalEmail }: AnalysisViewProps) {
  const router = useRouter();

  const handleGenerateReplyWithContext = (suggestedIntent?: string) => {
    // Store in sessionStorage or pass via searchParams so /reply can pick it up immediately
    const context = {
      receivedEmail: originalEmail,
      userIntent: suggestedIntent || analysis.intent || "",
    };
    sessionStorage.setItem("mailpilot:reply-context", JSON.stringify(context));
    router.push("/reply");
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Urgent":
        return <Badge variant="destructive">🔥 Urgent</Badge>;
      case "High":
        return <Badge variant="warning">⚡ High Urgency</Badge>;
      case "Medium":
        return <Badge variant="info">⏳ Medium Urgency</Badge>;
      default:
        return <Badge variant="secondary">☕ Low Urgency</Badge>;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <Badge variant="success">😊 Positive</Badge>;
      case "Negative":
        return <Badge variant="destructive">⚠️ Negative / Frustrated</Badge>;
      case "Mixed":
        return <Badge variant="warning">⚖️ Mixed</Badge>;
      default:
        return <Badge variant="secondary">😐 Neutral</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tone */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Tone
          </span>
          <span className="text-sm font-bold text-foreground truncate">
            {analysis.tone || "Professional"}
          </span>
        </div>

        {/* Sentiment */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sentiment
          </span>
          <div>{getSentimentBadge(analysis.sentiment)}</div>
        </div>

        {/* Urgency */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Urgency
          </span>
          <div>{getUrgencyBadge(analysis.urgency)}</div>
        </div>

        {/* Action Required */}
        <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Action Required
          </span>
          <div>
            {analysis.actionRequired ? (
              <Badge variant="warning">⚡ Yes, Action Needed</Badge>
            ) : (
              <Badge variant="secondary">No Action Needed</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Intent & Summary Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Sender Intent & Executive Summary
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed font-medium">
          {analysis.intent}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Important Information Structured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Action Items */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Action Items & Tasks</span>
          </div>
          <ul className="flex flex-col gap-1.5 pt-1">
            {analysis.importantDetails.actionItems.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dates & Deadlines */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Dates & Deadlines</span>
          </div>
          <ul className="flex flex-col gap-1.5 pt-1">
            {analysis.importantDetails.datesAndDeadlines.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Amounts & Numbers */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <span>Amounts & Financial Info</span>
          </div>
          <ul className="flex flex-col gap-1.5 pt-1">
            {analysis.importantDetails.amountsAndNumbers.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Questions Asked */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="h-4 w-4 text-purple-500" />
            <span>Questions To Answer</span>
          </div>
          <ul className="flex flex-col gap-1.5 pt-1">
            {analysis.importantDetails.questionsAsked.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-purple-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Quick Response & Primary CTA */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/30 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-foreground">Suggested Responses</h4>
            <p className="text-xs text-muted-foreground">
              Click any suggestion to generate a contextual reply automatically
            </p>
          </div>
          <Button
            onClick={() => handleGenerateReplyWithContext()}
            className="gap-2 rounded-xl shadow-md shadow-primary/20 shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>Generate Reply</span>
          </Button>
        </div>

        {analysis.suggestedReplies && analysis.suggestedReplies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {analysis.suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGenerateReplyWithContext(reply.intent)}
                className="flex flex-col items-start gap-1 rounded-xl border border-border/70 bg-card p-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  {reply.title}
                </span>
                <span className="text-[11px] text-muted-foreground line-clamp-2">
                  {reply.intent}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
