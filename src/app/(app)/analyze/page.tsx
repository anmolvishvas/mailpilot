"use client";

import * as React from "react";
import { BarChart3, Sparkles, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnalysisView } from "@/components/email/AnalysisView";
import { useToast } from "@/components/ui/toast";
import type { EmailAnalysisOutput } from "@/types";

export default function AnalyzePage() {
  const { success, error } = useToast();

  const [inputEmail, setInputEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<EmailAnalysisOutput | null>(null);

  const handleAnalyze = async () => {
    if (!inputEmail.trim()) {
      error("Please paste an email to analyze!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/email/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze email");
      }

      setAnalysis(data.data);
      success("Analysis complete!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to analyze email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Email Analysis</h2>
            <p className="text-xs text-muted-foreground">Deeply inspect tone, sentiment, urgency, deadlines, action items, and generate replies.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card/95">
        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Paste email to analyze
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Paste any email to extract tone, sentiment, urgency, hidden deadlines, questions, and action items..."
              className="min-h-[140px] text-sm p-4 rounded-2xl bg-muted/30 focus:bg-background border-border"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={loading || !inputEmail.trim()}
              className="gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{loading ? "Analyzing email..." : "Analyze Email"}</span>
            </Button>
          </div>
        </CardContent>

        {analysis && (
          <div className="border-t border-border bg-card p-6 sm:p-8">
            <AnalysisView analysis={analysis} originalEmail={inputEmail} />
          </div>
        )}
      </Card>
    </div>
  );
}
