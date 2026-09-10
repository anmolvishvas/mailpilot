"use client";

import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Send } from "lucide-react";
import type { TemplateField, LengthType } from "@/types";
import { standardTones, lengths } from "@/components/email/RecipientToneSelector";

interface TemplateFillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    title: string;
    description: string;
    category: string;
    fields: string; // JSON string
    defaultRecipient?: string | null;
    defaultTone?: string | null;
  } | null;
  onGenerate: (payload: {
    templateId: string;
    fieldValues: Record<string, string>;
    recipient?: string;
    tone?: string;
    length?: LengthType;
  }) => Promise<void>;
  loading?: boolean;
}

export function TemplateFillModal({
  open,
  onOpenChange,
  template,
  onGenerate,
  loading,
}: TemplateFillModalProps) {
  const [fieldValues, setFieldValues] = React.useState<Record<string, string>>({});
  const [tone, setTone] = React.useState<string>("professional");
  const [length, setLength] = React.useState<LengthType>("medium");

  const parsedFields: TemplateField[] = React.useMemo(() => {
    if (!template?.fields) return [];
    try {
      return JSON.parse(template.fields);
    } catch {
      return [];
    }
  }, [template?.fields]);

  React.useEffect(() => {
    if (template) {
      setTone(template.defaultTone || "professional");
      setLength("medium");
      const initial: Record<string, string> = {};
      parsedFields.forEach((f) => {
        initial[f.name] = "";
      });
      setFieldValues(initial);
    }
  }, [template, parsedFields]);

  if (!template) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      templateId: template.id,
      fieldValues,
      recipient: template.defaultRecipient || "Colleague",
      tone,
      length,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] uppercase font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
              {template.category}
            </span>
          </div>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <span>{template.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {template.description}
          </DialogDescription>
        </DialogHeader>

        {/* Dynamic Fields */}
        <div className="flex flex-col gap-3 py-2 max-h-[55vh] overflow-y-auto pr-1">
          {parsedFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-foreground flex items-center gap-1">
                <span>{field.label}</span>
                {field.required && <span className="text-destructive">*</span>}
              </label>
              {field.type === "textarea" ? (
                <Textarea
                  value={fieldValues[field.name] || ""}
                  onChange={(e) =>
                    setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                  className="min-h-[80px] text-xs p-2.5 rounded-lg bg-background border border-input"
                />
              ) : (
                <Input
                  value={fieldValues[field.name] || ""}
                  onChange={(e) =>
                    setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                  className="h-8 text-xs rounded-lg"
                />
              )}
            </div>
          ))}

          {/* Tone & Length Overrides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:ring-1 focus:ring-ring"
              >
                {standardTones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-muted-foreground">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthType)}
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium focus:ring-1 focus:ring-ring"
              >
                {lengths.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-1.5 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs font-medium gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{loading ? "Writing Email..." : "Generate Email"}</span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
