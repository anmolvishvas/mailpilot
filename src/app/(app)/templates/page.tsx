"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Landmark,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplateFillModal } from "@/components/templates/TemplateFillModal";
import { OutputActions } from "@/components/email/OutputActions";
import { useToast } from "@/components/ui/toast";
import type { LengthType, EmailGenerationOutput } from "@/types";

const categories = [
  { id: "ALL", label: "All Templates", icon: FileText },
  { id: "WORK", label: "Work & Career", icon: Briefcase },
  { id: "BUSINESS", label: "Business & Sales", icon: Building2 },
  { id: "EDUCATION", label: "Education & Academic", icon: GraduationCap },
  { id: "PERSONAL", label: "Personal & Social", icon: Heart },
  { id: "OFFICIAL", label: "Official & Legal", icon: Landmark },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [templates, setTemplates] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Template fill modal state
  const [activeTemplate, setActiveTemplate] = React.useState<any | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  // Output card state
  const [output, setOutput] = React.useState<EmailGenerationOutput | null>(null);
  const [lastGeneratedTemplateTitle, setLastGeneratedTemplateTitle] = React.useState("");
  const [editableBody, setEditableBody] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const fetchTemplates = React.useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const url = cat === "ALL" ? "/api/templates" : `/api/templates?category=${cat}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch {
      error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTemplates(selectedCategory);
  }, [selectedCategory, fetchTemplates]);

  const filteredTemplates = React.useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [templates, search]);

  const handleOpenFillModal = (template: any) => {
    setActiveTemplate(template);
    setModalOpen(true);
  };

  const handleGenerateFromTemplate = async (payload: {
    templateId: string;
    fieldValues: Record<string, string>;
    recipient?: string;
    tone?: string;
    length?: LengthType;
  }) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate template email");
      }

      setOutput(data.data);
      setEditableBody(data.data.body);
      setLastGeneratedTemplateTitle(activeTemplate?.title || "Template Email");
      setModalOpen(false);
      success("Email generated from template!");

      if (data.usage) {
        window.dispatchEvent(
          new CustomEvent("mailpilot:usage-updated", { detail: data.usage })
        );
      }
    } catch (err: any) {
      error(err.message || "Failed to generate from template");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Template Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">35+ ready-to-use email templates for work, business, academic, and personal use.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-8.5 rounded-lg h-9 text-xs"
          />
        </div>
      </div>

      {/* Generated Output Preview if generated */}
      {output && (
        <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-in fade-in">
          <CardHeader className="p-4 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Generated: {lastGeneratedTemplateTitle}
              </CardTitle>
              <Badge variant="outline" className="text-[11px] capitalize font-medium">
                {output.tone}
              </Badge>
            </div>
            <div className="text-xs text-foreground font-medium pt-0.5">
              Subject: {output.subject}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isEditing ? (
              <textarea
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                className="w-full min-h-[160px] text-xs font-mono leading-relaxed p-3 rounded-lg bg-background border border-input"
              />
            ) : (
              <div className="rounded-lg border border-border bg-secondary/20 p-4 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-normal">
                {editableBody || output.body}
              </div>
            )}
          </CardContent>
          <OutputActions
            subject={output.subject}
            body={editableBody || output.body}
            originalPrompt={`Template: ${lastGeneratedTemplateTitle}`}
            category="TEMPLATE"
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onClear={() => setOutput(null)}
          />
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-foreground text-background font-semibold"
                  : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-secondary/30 p-4 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground">No templates found</h3>
          <p className="text-xs text-muted-foreground">Try clearing your search query or switching categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleOpenFillModal(template)}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:border-foreground/30 transition-colors cursor-pointer group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {template.category}
                  </span>
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1 font-medium">
                    Use <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-foreground group-hover:underline">
                  {template.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>For: {template.defaultRecipient || "Anyone"}</span>
                <span className="capitalize">{template.defaultTone || "Professional"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Fill Modal */}
      <TemplateFillModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        template={activeTemplate}
        onGenerate={handleGenerateFromTemplate}
        loading={generating}
      />
    </div>
  );
}
