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
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Template Library</h2>
            <p className="text-xs text-muted-foreground">35+ ready-to-use email templates across work, business, education & more.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Generated Output Preview if generated */}
      {output && (
        <Card className="rounded-3xl border-2 border-primary/40 bg-card shadow-2xl overflow-hidden animate-in fade-in">
          <CardHeader className="p-6 border-b border-border/60 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  Generated: {lastGeneratedTemplateTitle}
                </CardTitle>
              </div>
              <Badge variant="default" className="text-xs capitalize">
                {output.tone} Tone
              </Badge>
            </div>
            <div className="text-xs font-semibold text-foreground pt-1">
              Subject: {output.subject}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing ? (
              <textarea
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                className="w-full min-h-[180px] text-sm font-mono leading-relaxed p-4 rounded-xl bg-muted/20 border border-border"
              />
            ) : (
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 text-sm whitespace-pre-wrap leading-relaxed font-medium">
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl border border-border bg-card/60 p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center gap-2">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-bold text-foreground">No templates found</h3>
          <p className="text-xs text-muted-foreground">Try clearing your search query or switching categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleOpenFillModal(template)}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                    {template.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-medium">
                    Use Template <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>For: <strong>{template.defaultRecipient || "Anyone"}</strong></span>
                <span className="capitalize">{template.defaultTone || "Professional"} tone</span>
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
