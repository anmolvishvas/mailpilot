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
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Email Analysis</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Extract tone, sentiment, urgency, deadlines, action items, and draft contextual replies.</p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Email to Analyze
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Paste any received or sent email to analyze..."
              className="min-h-[120px] text-sm p-3 rounded-lg bg-background border border-input focus:border-ring"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleAnalyze}
              disabled={loading || !inputEmail.trim()}
              className="h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{loading ? "Analyzing..." : "Analyze Email"}</span>
            </Button>
          </div>
        </CardContent>

        {analysis && (
          <div className="border-t border-border bg-card p-5">
            <AnalysisView analysis={analysis} originalEmail={inputEmail} />
          </div>
        )}
      </Card>
    </div>
  );
}
