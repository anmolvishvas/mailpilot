"use client";

import * as React from "react";
import { Sliders, Plus, Edit2, Trash2, CheckCircle2, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export default function TonesPage() {
  const { success, error } = useToast();

  const [tones, setTones] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingTone, setEditingTone] = React.useState<any | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const fetchTones = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tones");
      if (res.ok) {
        const data = await res.json();
        setTones(data);
      }
    } catch {
      error("Failed to load custom tones");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTones();
  }, [fetchTones]);

  const handleOpenCreate = () => {
    setEditingTone(null);
    setName("");
    setDescription("");
    setInstructions("");
    setIsDefault(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (tone: any) => {
    setEditingTone(tone);
    setName(tone.name);
    setDescription(tone.description);
    setInstructions(tone.instructions);
    setIsDefault(tone.isDefault);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !instructions.trim()) {
      error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        isDefault,
      };

      let res;
      if (editingTone) {
        res = await fetch(`/api/tones/${editingTone.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/tones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save tone");
      }

      success(editingTone ? "Custom tone updated!" : "Custom tone created!");
      setModalOpen(false);
      fetchTones();
    } catch (err: any) {
      error(err.message || "Failed to save custom tone");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom tone?")) return;
    try {
      const res = await fetch(`/api/tones/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTones((prev) => prev.filter((t) => t.id !== id));
        success("Custom tone deleted");
      }
    } catch {
      error("Failed to delete tone");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/tones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setDefault" }),
      });
      if (res.ok) {
        success("Set as default tone!");
        fetchTones();
      }
    } catch {
      error("Failed to set default tone");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Custom Tones</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define personal writing styles and specific instructions for AI generations.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 rounded-lg text-xs font-medium h-8">
          <Plus className="h-3.5 w-3.5" />
          <span>Create Tone</span>
        </Button>
      </div>

      {/* Tones List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl border border-border bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : tones.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center flex flex-col items-center gap-2">
          <Sliders className="h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground">No custom tones created yet</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Create a custom tone (e.g. "Executive Brief" or "Client Support") to personalize AI writing style.
          </p>
          <Button onClick={handleOpenCreate} size="sm" className="mt-1 h-8 text-xs rounded-lg">
            Create Tone
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tones.map((tone) => (
            <div
              key={tone.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{tone.name}</h3>
                    {tone.isDefault && (
                      <span className="text-[10px] font-medium bg-secondary border border-border text-foreground px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(tone)}
                      className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(tone.id)}
                      className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{tone.description}</p>

                <div className="rounded-lg bg-secondary/30 border border-border p-2.5 text-xs">
                  <span className="font-medium text-muted-foreground block mb-0.5 text-[11px]">
                    Instructions:
                  </span>
                  <span className="text-foreground leading-relaxed font-mono text-[11px]">
                    {tone.instructions}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                {!tone.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetDefault(tone.id)}
                    className="h-7 text-xs rounded-md font-normal"
                  >
                    Set as Default
                  </Button>
                )}
                <span className="text-[11px] text-muted-foreground ml-auto">
                  Available in tone selector
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{editingTone ? "Edit Custom Tone" : "Create Custom Tone"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define formatting rules and tone instructions for the AI to follow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-foreground">Tone Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Executive Brief"
                className="h-8 text-xs rounded-lg"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-foreground">Short Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Concise and direct for management updates"
                className="h-8 text-xs rounded-lg"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-foreground">AI Instructions</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Keep emails under 100 words. Use bullet points for metrics."
                required
                className="min-h-[90px] text-xs p-2.5 rounded-lg bg-background border border-input"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultCheckbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input text-foreground focus:ring-ring cursor-pointer"
              />
              <label htmlFor="isDefaultCheckbox" className="text-xs text-muted-foreground cursor-pointer">
                Set as default tone
              </label>
            </div>
          </div>

          <DialogFooter className="gap-1.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="h-8 text-xs font-medium">
              {saving ? "Saving..." : editingTone ? "Update Tone" : "Create Tone"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
