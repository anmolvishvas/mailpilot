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
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] uppercase font-bold">
              {template.category}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>{template.title}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {template.description}
          </DialogDescription>
        </DialogHeader>

        {/* Dynamic Fields */}
        <div className="flex flex-col gap-4 py-2 max-h-[55vh] overflow-y-auto pr-1">
          {parsedFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>{field.label}</span>
                {field.required && <span className="text-rose-500">*</span>}
              </label>
              {field.type === "textarea" ? (
                <Textarea
                  value={fieldValues[field.name] || ""}
                  onChange={(e) =>
                    setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                  rows={3}
                />
              ) : (
                <Input
                  value={fieldValues[field.name] || ""}
                  onChange={(e) =>
                    setFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                />
              )}
            </div>
          ))}

          {/* Tone & Length Overrides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {standardTones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthType)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
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

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="gap-2 shadow-md shadow-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>{loading ? "Writing Email..." : "Generate Email"}</span>
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
