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
    <div className="flex flex-col gap-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Email Translation</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Translate emails across 11 languages while maintaining tone and business nuance.</p>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-5 flex flex-col gap-4">
          {/* Language Selection Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-secondary/30 p-2.5 rounded-lg border border-border">
            <div className="flex-1 w-full flex flex-col gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From</span>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:ring-1 focus:ring-ring"
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
              className="h-8 w-8 rounded-md mt-0 sm:mt-4 shrink-0"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </Button>

            <div className="flex-1 w-full flex flex-col gap-1">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:ring-1 focus:ring-ring"
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Original Email
            </label>
            <Textarea
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Type or paste the email you want to translate..."
              className="min-h-[120px] text-sm p-3 rounded-lg bg-background border border-input focus:border-ring"
            />
          </div>

          {/* Tone Preservation Checkbox */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-2.5">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">Preserve Professional Tone</span>
                <span className="text-[11px] text-muted-foreground">
                  Keeps the original formality and contextual intent.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preserveTone}
              onChange={(e) => setPreserveTone(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input text-foreground focus:ring-ring cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleTranslate}
              disabled={loading || !inputEmail.trim()}
              className="h-8 px-4 gap-1.5 rounded-lg text-xs font-medium"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{loading ? "Translating..." : "Translate Email"}</span>
            </Button>
          </div>
        </CardContent>

        {output && (
          <div className="border-t border-border bg-card">
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Translated Output ({output.targetLanguage})
                </span>
                <Badge variant="outline" className="text-[11px] font-medium">
                  {output.detectedTone || "Preserved Tone"}
                </Badge>
              </div>

              {isEditing ? (
                <Textarea
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="min-h-[180px] text-xs font-mono leading-relaxed p-3.5 rounded-lg bg-background border border-input"
                />
              ) : (
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-normal">
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
