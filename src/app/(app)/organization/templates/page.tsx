"use client";

import * as React from "react";
import Link from "next/link";
import { FolderLock, Plus, Trash2, ArrowRight, ArrowLeft, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TemplateFillModal } from "@/components/templates/TemplateFillModal";
import { useToast } from "@/components/ui/toast";
import type { LengthType } from "@/types";

export default function SharedTemplatesPage() {
  const { success, error } = useToast();

  const [orgs, setOrgs] = React.useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Create Shared Template Modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [promptTemplate, setPromptTemplate] = React.useState("");
  const [fieldsJson, setFieldsJson] = React.useState(
    JSON.stringify([
      { name: "customerName", label: "Customer Name", placeholder: "e.g. Jordan", type: "text", required: true },
      { name: "orderId", label: "Order #", placeholder: "e.g. #9021", type: "text", required: true },
    ], null, 2)
  );
  const [creating, setCreating] = React.useState(false);

  // Fill modal
  const [activeTemplate, setActiveTemplate] = React.useState<any | null>(null);
  const [fillModalOpen, setFillModalOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const fetchOrgs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data);
        if (data.length > 0) {
          fetchOrgDetails(data[0].id);
        }
      }
    } catch {
      error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrgDetails = async (orgId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrg(data);
      }
    } catch {
      error("Failed to load templates");
    }
  };

  React.useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleCreateSharedTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !promptTemplate.trim() || !selectedOrg) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          promptTemplate: promptTemplate.trim(),
          fields: fieldsJson,
          category: "WORK",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create shared template");
      }

      success("Shared template created!");
      setCreateModalOpen(false);
      setTitle("");
      setDescription("");
      setPromptTemplate("");
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      error(err.message || "Failed to create shared template");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSharedTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedOrg || !confirm("Are you sure you want to delete this shared template?")) return;

    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/templates?templateId=${templateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete shared template");
      }

      success("Shared template removed");
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      error(err.message || "Failed to delete template");
    }
  };

  const handleGenerate = async (payload: {
    templateId: string;
    fieldValues: Record<string, string>;
    recipient?: string;
    tone?: string;
    length?: LengthType;
  }) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/email/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activeTemplate?.promptTemplate || "Write email",
          recipient: payload.recipient,
          tone: payload.tone,
          length: payload.length,
          organizationId: selectedOrg?.id,
        }),
      });

      if (res.ok) {
        success("Email generated using shared template!");
        setFillModalOpen(false);
      }
    } catch {
      error("Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const canManage = selectedOrg?.currentUserRole === "OWNER" || selectedOrg?.currentUserRole === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/organization">
            <Button variant="ghost" size="iconSm" className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <FolderLock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Shared Templates</h2>
              <p className="text-xs text-muted-foreground">Standardized email templates accessible across your organization.</p>
            </div>
          </div>
        </div>

        {canManage && (
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 rounded-xl font-bold">
            <Plus className="h-4 w-4" />
            <span>Create Shared Template</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl border border-border bg-card/60 animate-pulse" />
      ) : !selectedOrg ? (
        <Card className="rounded-3xl border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Please create or join an organization first.</p>
        </Card>
      ) : selectedOrg.sharedTemplates?.length === 0 ? (
        <Card className="rounded-3xl border border-border p-12 text-center flex flex-col items-center gap-3">
          <FolderLock className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-bold text-foreground">No shared templates yet</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Create standard company replies, customer refund confirmations, or team updates for all members.
          </p>
          {canManage && (
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="mt-2 rounded-xl">
              Create First Shared Template
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedOrg.sharedTemplates?.map((template: any) => (
            <div
              key={template.id}
              onClick={() => {
                setActiveTemplate(template);
                setFillModalOpen(true);
              }}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="info" className="text-[10px] uppercase font-bold">
                    Company Shared
                  </Badge>
                  {canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDeleteSharedTemplate(template.id, e)}
                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {template.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Created by: {template.createdBy?.name || "Admin"}</span>
                <span className="font-semibold text-primary flex items-center gap-1">
                  Use Template <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <form onSubmit={handleCreateSharedTemplate}>
          <DialogHeader>
            <DialogTitle>Create Shared Company Template</DialogTitle>
            <DialogDescription>
              All members of {selectedOrg?.name} will be able to use this template in their daily workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Template Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Customer Support - Refund Processed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Standard confirmation email for refund processing"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">AI Prompt Template</label>
              <Textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                placeholder="e.g. Confirm full refund of {{refundAmount}} for order {{orderId}} to {{customerName}}."
                required
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="font-bold">
              {creating ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Fill Modal */}
      <TemplateFillModal
        open={fillModalOpen}
        onOpenChange={setFillModalOpen}
        template={activeTemplate}
        onGenerate={handleGenerate}
        loading={generating}
      />
    </div>
  );
}
