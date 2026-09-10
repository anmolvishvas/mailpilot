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
        return <Badge variant="destructive" className="text-[11px] font-medium">Urgent</Badge>;
      case "High":
        return <Badge variant="warning" className="text-[11px] font-medium">High</Badge>;
      case "Medium":
        return <Badge variant="info" className="text-[11px] font-medium">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px] font-medium">Low</Badge>;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <Badge variant="success" className="text-[11px] font-medium">Positive</Badge>;
      case "Negative":
        return <Badge variant="destructive" className="text-[11px] font-medium">Negative</Badge>;
      case "Mixed":
        return <Badge variant="warning" className="text-[11px] font-medium">Mixed</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px] font-medium">Neutral</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Tone */}
        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Tone
          </span>
          <span className="text-xs font-semibold text-foreground truncate">
            {analysis.tone || "Professional"}
          </span>
        </div>

        {/* Sentiment */}
        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Sentiment
          </span>
          <div>{getSentimentBadge(analysis.sentiment)}</div>
        </div>

        {/* Urgency */}
        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Urgency
          </span>
          <div>{getUrgencyBadge(analysis.urgency)}</div>
        </div>

        {/* Action Required */}
        <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background p-3">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Action Needed
          </span>
          <div>
            {analysis.actionRequired ? (
              <Badge variant="warning" className="text-[11px] font-medium">Required</Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px] font-medium">None</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Intent & Summary Banner */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/30 p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Sender Intent & Summary
        </span>
        <p className="text-xs text-foreground leading-relaxed font-medium">
          {analysis.intent}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Important Information Structured Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Action Items */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Action Items</span>
          </div>
          <ul className="flex flex-col gap-1">
            {analysis.importantDetails.actionItems.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dates & Deadlines */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Dates & Deadlines</span>
          </div>
          <ul className="flex flex-col gap-1">
            {analysis.importantDetails.datesAndDeadlines.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Amounts & Numbers */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Amounts & Financial Info</span>
          </div>
          <ul className="flex flex-col gap-1">
            {analysis.importantDetails.amountsAndNumbers.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Questions Asked */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Questions To Answer</span>
          </div>
          <ul className="flex flex-col gap-1">
            {analysis.importantDetails.questionsAsked.map((item, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Quick Response & Primary CTA */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Suggested Responses</h4>
            <p className="text-[11px] text-muted-foreground">
              Click any suggestion to draft a response in the reply generator
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => handleGenerateReplyWithContext()}
            className="h-7 px-3 text-xs gap-1.5 rounded-lg shrink-0 font-medium"
          >
            <Send className="h-3 w-3" />
            <span>Draft Reply</span>
          </Button>
        </div>

        {analysis.suggestedReplies && analysis.suggestedReplies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {analysis.suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGenerateReplyWithContext(reply.intent)}
                className="flex flex-col items-start gap-0.5 rounded-lg border border-border bg-card p-2.5 text-left hover:bg-secondary transition-colors group"
              >
                <span className="text-xs font-semibold text-foreground group-hover:underline flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
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
