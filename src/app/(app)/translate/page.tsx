"use client";

import * as React from "react";
import { Languages, ArrowLeftRight, Sparkles, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutputActions } from "@/components/email/OutputActions";
import { useToast } from "@/components/ui/toast";
import type { TranslationOutput } from "@/types";

const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "ko", name: "Korean (한국어)" },
];

export default function TranslatePage() {
  const { success, error } = useToast();

  const [inputEmail, setInputEmail] = React.useState("");
  const [sourceLang, setSourceLang] = React.useState("en");
  const [targetLang, setTargetLang] = React.useState("hi");
  const [preserveTone, setPreserveTone] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState<TranslationOutput | null>(null);
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleTranslate = async () => {
    if (!inputEmail.trim()) {
      error("Please paste the email text to translate!");
      return;
    }

    setLoading(true);
    try {
      const targetLangName = supportedLanguages.find((l) => l.code === targetLang)?.name || targetLang;
      const sourceLangName = supportedLanguages.find((l) => l.code === sourceLang)?.name || sourceLang;

      const res = await fetch("/api/email/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inputEmail.trim(),
          targetLanguage: targetLangName,
          sourceLanguage: sourceLangName,
          preserveTone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to translate email");
      }

      setOutput(data.data);
      setEditableBody(data.data.translatedText);
      setIsEditing(false);
      success("Translation complete!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to translate email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Languages className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Email Translation</h2>
            <p className="text-xs text-muted-foreground">Translate emails across 11 languages while maintaining tone and business nuance.</p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-border/80 shadow-xl overflow-hidden bg-card/95">
        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Language Selection Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-muted/40 p-3 rounded-2xl border border-border/60">
            <div className="flex-1 w-full flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">From</span>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwap}
              title="Swap languages"
              className="rounded-xl mt-4 sm:mt-5 shrink-0"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="flex-1 w-full flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">To</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Text */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Original Email
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Type or paste the email you want to translate..."
              className="min-h-[140px] text-sm p-4 rounded-2xl bg-muted/30 focus:bg-background border-border"
            />
          </div>

          {/* Tone Preservation Checkbox */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Preserve Professional Tone</span>
                <span className="text-[11px] text-muted-foreground">
                  Keeps the original formality and contextual intent instead of literal awkward translations.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preserveTone}
              onChange={(e) => setPreserveTone(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="lg"
              onClick={handleTranslate}
              disabled={loading || !inputEmail.trim()}
              className="gap-2 rounded-2xl px-8 font-bold shadow-lg shadow-cyan-500/25 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Globe className="h-4 w-4" />
              <span>{loading ? "Translating..." : "Translate Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Translated Output ({output.targetLanguage})</span>
                </span>
                <Badge variant="outline" className="text-xs">
                  {output.detectedTone || "Preserved Tone"}
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
                  {editableBody || output.translatedText}
                </div>
              )}
            </div>

            <OutputActions
              subject={`Translated Email (${output.targetLanguage})`}
              body={editableBody || output.translatedText}
              originalPrompt={inputEmail}
              category="TRANSLATION"
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
              onRegenerate={() => handleTranslate()}
              onClear={() => setOutput(null)}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
