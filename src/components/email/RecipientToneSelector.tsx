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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
      {/* Recipient */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Recipient
        </label>
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          {recipients.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Tone */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Tone
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        >
          <optgroup label="Standard Tones">
            {standardTones.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </optgroup>
          {customTones.length > 0 && (
            <optgroup label="Custom Tones">
              {customTones.map((ct) => (
                <option key={ct.id} value={`custom:${ct.id}`}>
                  {ct.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Length */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Length
        </label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value as LengthType)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
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
        <div className="sm:col-span-3 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              Apply <strong>{orgContext.name}</strong> Brand Voice
            </span>
          </div>
          <input
            type="checkbox"
            id="orgToneCheckbox"
            checked={useOrgTone}
            onChange={(e) => setUseOrgTone(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-input text-foreground focus:ring-ring cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
