"use client";

import * as React from "react";
import {
  Copy,
  Check,
  Edit3,
  BookmarkPlus,
  RotateCcw,
  Download,
  Trash2,
  FileCode,
  FileText,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportAsEml, exportAsTxt, exportAsMarkdown } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OutputActionsProps {
  subject: string;
  body: string;
  originalPrompt?: string;
  recipient?: string;
  tone?: string;
  category?: string;
  onRegenerate?: () => void;
  onEditToggle?: () => void;
  isEditing?: boolean;
  onClear?: () => void;
}

export function OutputActions({
  subject,
  body,
  originalPrompt,
  recipient,
  tone,
  category = "GENERATED",
  onRegenerate,
  onEditToggle,
  isEditing,
  onClear,
}: OutputActionsProps) {
  const [copied, setCopied] = React.useState(false);
  const [saveModalOpen, setSaveModalOpen] = React.useState(false);
  const [saveTitle, setSaveTitle] = React.useState(subject || "My Generated Email");
  const [saving, setSaving] = React.useState(false);
  const { success, error } = useToast();

  const handleCopy = async () => {
    try {
      const fullText = subject ? `Subject: ${subject}\n\n${body}` : body;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      error("Failed to copy to clipboard");
    }
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle.trim(),
          category,
          subject,
          body,
          originalPrompt,
          recipient,
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save email to history");
      }

      success("Email saved to your History!");
      setSaveModalOpen(false);
    } catch (err: any) {
      error(err.message || "Could not save email");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/30 px-4 py-2.5 rounded-b-xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Copy Button */}
          <Button
            size="sm"
            variant="default"
            onClick={handleCopy}
            className="gap-1.5 rounded-lg text-xs font-medium h-8"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>

          {/* Edit Toggle */}
          {onEditToggle && (
            <Button
              size="sm"
              variant={isEditing ? "secondary" : "outline"}
              onClick={onEditToggle}
              className="gap-1.5 rounded-lg text-xs font-medium h-8"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? "Done" : "Edit"}</span>
            </Button>
          )}

          {/* Save to History */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSaveTitle(subject || "My Generated Email");
              setSaveModalOpen(true);
            }}
            className="gap-1.5 rounded-lg text-xs font-medium h-8"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {/* Regenerate */}
          {onRegenerate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRegenerate}
              title="Regenerate email"
              className="gap-1.5 rounded-lg text-xs font-medium h-8 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Regenerate</span>
            </Button>
          )}

          {/* Download Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1.5 rounded-lg text-xs font-medium h-8 text-muted-foreground hover:text-foreground">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" className="w-48">
              <DropdownMenuItem onClick={() => exportAsEml(subject, body)}>
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Outlook / Apple Mail (.eml)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAsTxt(subject, body)}>
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Plain Text (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAsMarkdown(subject, body)}>
                <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Markdown (.md)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear */}
          {onClear && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              title="Delete output"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Save Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogHeader>
          <DialogTitle>Save to History</DialogTitle>
          <DialogDescription>
            Give this email a title so you can easily find and reuse it from your History.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Email Title
          </label>
          <Input
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="e.g. Leave request to David"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !saveTitle.trim()}>
            {saving ? "Saving..." : "Save Email"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
