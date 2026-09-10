"use client";

import * as React from "react";
import type { RecipientType, ToneType, LengthType } from "@/types";
import { Sliders, User, MessageSquare, AlignLeft, Building2 } from "lucide-react";

export const recipients: RecipientType[] = [
  "Manager",
  "HR",
  "Client",
  "Customer",
  "Colleague",
  "Teacher / Professor",
  "Friend",
  "Company",
  "Government / Official",
  "Other",
];

export const standardTones: { value: ToneType; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Clear, courteous, and business-appropriate" },
  { value: "friendly", label: "Friendly", description: "Warm, personable, and approachable" },
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  { value: "formal", label: "Formal", description: "Strict, traditional, and respectful" },
  { value: "polite", label: "Polite", description: "Extra respectful and considerate" },
  { value: "apologetic", label: "Apologetic", description: "Graceful, sincere, and acknowledging mistakes" },
  { value: "assertive", label: "Assertive", description: "Firm, direct, and unambiguous" },
  { value: "persuasive", label: "Persuasive", description: "Compelling and action-driving" },
  { value: "confident", label: "Confident", description: "Authoritative and assured" },
  { value: "warm", label: "Warm", description: "Empathetic, kind, and supportive" },
  { value: "diplomatic", label: "Diplomatic", description: "Tactful, balanced, and resolving conflict" },
  { value: "concise", label: "Concise", description: "Straight to the point with zero fluff" },
  { value: "executive", label: "Executive", description: "High-level bottom-line focus for leadership" },
];

export const lengths: { value: LengthType; label: string }[] = [
  { value: "short", label: "Short (1-2 paragraphs)" },
  { value: "medium", label: "Medium (Standard)" },
  { value: "detailed", label: "Detailed (Comprehensive)" },
  { value: "long", label: "Long (In-depth)" },
];

interface RecipientToneSelectorProps {
  recipient: string;
  setRecipient: (r: string) => void;
  tone: string;
  setTone: (t: string) => void;
  length: LengthType;
  setLength: (l: LengthType) => void;
  customTones?: Array<{ id: string; name: string; instructions: string }>;
  orgContext?: { id: string; name: string; companyTone?: string } | null;
  useOrgTone?: boolean;
  setUseOrgTone?: (val: boolean) => void;
}

export function RecipientToneSelector({
  recipient,
  setRecipient,
  tone,
  setTone,
  length,
  setLength,
  customTones = [],
  orgContext,
  useOrgTone,
  setUseOrgTone,
}: RecipientToneSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
      {/* Recipient */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <User className="h-3.5 w-3.5 text-primary" />
          <span>Who is this for?</span>
        </label>
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
        >
          {recipients.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Tone */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span>Tone</span>
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
        >
          <optgroup label="Standard Tones">
            {standardTones.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </optgroup>
          {customTones.length > 0 && (
            <optgroup label="My Custom Tones">
              {customTones.map((ct) => (
                <option key={ct.id} value={`custom:${ct.id}`}>
                  ✨ {ct.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Length */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <AlignLeft className="h-3.5 w-3.5 text-primary" />
          <span>Length</span>
        </label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value as LengthType)}
          className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
        >
          {lengths.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Org Tone toggle if organization is active */}
      {orgContext && setUseOrgTone && (
        <div className="sm:col-span-3 flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-foreground">
              Apply <strong className="text-foreground">{orgContext.name}</strong> Company Tone & Brand Voice
            </span>
          </div>
          <input
            type="checkbox"
            id="orgToneCheckbox"
            checked={useOrgTone}
            onChange={(e) => setUseOrgTone(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
