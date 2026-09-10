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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">My Custom Tones</h2>
            <p className="text-xs text-muted-foreground">
              Define your unique writing styles and instructions to personalize every email.
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 rounded-xl font-bold shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" />
          <span>Create Custom Tone</span>
        </Button>
      </div>

      {/* Tones List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl border border-border bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : tones.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center gap-3">
          <Sliders className="h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-bold text-foreground">No custom tones created yet</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Create a custom tone (e.g. "Executive Brief" or "Casual Client") so the AI writes exactly how you like.
          </p>
          <Button onClick={handleOpenCreate} size="sm" className="mt-2 rounded-xl">
            Create First Tone
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tones.map((tone) => (
            <div
              key={tone.id}
              className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{tone.name}</h3>
                    {tone.isDefault && (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(tone)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(tone.id)}
                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{tone.description}</p>

                <div className="rounded-xl bg-muted/30 border border-border/60 p-3 text-xs">
                  <span className="font-semibold text-muted-foreground block mb-1">
                    AI Instructions:
                  </span>
                  <span className="text-foreground leading-relaxed font-mono text-[11px]">
                    {tone.instructions}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                {!tone.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetDefault(tone.id)}
                    className="h-8 text-xs rounded-xl"
                  >
                    Set as Default
                  </Button>
                )}
                <span className="text-[11px] text-muted-foreground ml-auto">
                  Available in Generator dropdown
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
            <DialogTitle>{editingTone ? "Edit Custom Tone" : "Create Custom Tone"}</DialogTitle>
            <DialogDescription>
              Teach MailPilot your specific writing style, formatting rules, and vocabulary preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tone Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Work Tone / Executive Brief"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Short Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Professional but friendly. Keep emails concise and clear."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">AI Writing Instructions</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Keep emails under 120 words. Start with a warm greeting. Use bullet points for action items. Avoid corporate buzzwords."
                required
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultCheckbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isDefaultCheckbox" className="text-xs font-medium text-foreground cursor-pointer">
                Set as my default tone across the app
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="font-bold">
              {saving ? "Saving..." : editingTone ? "Update Tone" : "Create Tone"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
