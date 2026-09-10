"use client";

import * as React from "react";
import Link from "next/link";
import { Volume2, Sparkles, ArrowLeft, Shield, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function BrandVoicePage() {
  const { success, error } = useToast();

  const [orgs, setOrgs] = React.useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [companyToneDesc, setCompanyToneDesc] = React.useState("");
  const [companyToneRules, setCompanyToneRules] = React.useState("");
  const [personality, setPersonality] = React.useState("");
  const [wordsToUse, setWordsToUse] = React.useState("");
  const [wordsToAvoid, setWordsToAvoid] = React.useState("");

  const [savingTone, setSavingTone] = React.useState(false);
  const [savingVoice, setSavingVoice] = React.useState(false);

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
        setCompanyToneDesc(data.companyTone?.description || "Clear, friendly, and professional.");
        setCompanyToneRules(data.companyTone?.rules || "");
        setPersonality(data.brandVoice?.personality || "Friendly, Confident, Professional");
        setWordsToUse(data.brandVoice?.wordsToUse || "Customer, Partner, Team");
        setWordsToAvoid(data.brandVoice?.wordsToAvoid || "Unfortunately, Esteemed, Kindly");
      }
    } catch {
      error("Failed to load voice settings");
    }
  };

  React.useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleSaveCompanyTone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setSavingTone(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/voice`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "companyTone",
          data: {
            description: companyToneDesc,
            rules: companyToneRules || undefined,
            isActive: true,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update company tone");
      }

      success("Company Tone updated!");
    } catch (err: any) {
      error(err.message || "Failed to update tone");
    } finally {
      setSavingTone(false);
    }
  };

  const handleSaveBrandVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setSavingVoice(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/voice`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "brandVoice",
          data: {
            personality,
            wordsToUse,
            wordsToAvoid,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update brand voice");
      }

      success("Brand Voice updated!");
    } catch (err: any) {
      error(err.message || "Failed to update brand voice");
    } finally {
      setSavingVoice(false);
    }
  };

  const canManage = selectedOrg?.currentUserRole === "OWNER" || selectedOrg?.currentUserRole === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/organization">
          <Button variant="ghost" size="iconSm" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Brand Voice & Company Tone</h2>
            <p className="text-xs text-muted-foreground">Standardize writing tone and vocabulary across all organization emails.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl border border-border bg-card/60 animate-pulse" />
      ) : !selectedOrg ? (
        <Card className="rounded-3xl border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Please create or select an organization first.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Company Tone */}
          <Card className="rounded-3xl border border-border bg-card shadow-sm">
            <form onSubmit={handleSaveCompanyTone}>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-bold">Company Writing Tone</CardTitle>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  The overarching tone of voice incorporated when members generate emails for {selectedOrg.name}.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tone Description</label>
                  <Textarea
                    value={companyToneDesc}
                    onChange={(e) => setCompanyToneDesc(e.target.value)}
                    placeholder="e.g. Clear, friendly and professional. Avoid overly formal language. Keep customer communication concise and helpful."
                    disabled={!canManage}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Special Rules / Signing Off</label>
                  <Input
                    value={companyToneRules}
                    onChange={(e) => setCompanyToneRules(e.target.value)}
                    placeholder="e.g. Sign off as 'The Acme Team'. Always offer next steps."
                    disabled={!canManage}
                  />
                </div>

                {canManage && (
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={savingTone} className="gap-2 rounded-xl font-bold">
                      <Save className="h-4 w-4" />
                      <span>{savingTone ? "Saving..." : "Save Company Tone"}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>

          {/* Section 2: Brand Voice Preferences */}
          <Card className="rounded-3xl border border-border bg-card shadow-sm">
            <form onSubmit={handleSaveBrandVoice}>
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg font-bold">Brand Voice Guidelines</CardTitle>
                  </div>
                  <Badge variant="purple" className="text-[10px]">
                    Vocabulary
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Configure brand personality traits, preferred vocabulary, and phrases to avoid.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Personality</label>
                  <Input
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="e.g. Friendly, Confident, Innovative, Responsive"
                    disabled={!canManage}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Words to Use</label>
                  <Input
                    value={wordsToUse}
                    onChange={(e) => setWordsToUse(e.target.value)}
                    placeholder="e.g. Customer, Partner, Team, Solution, Delight"
                    disabled={!canManage}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Words to Avoid</label>
                  <Input
                    value={wordsToAvoid}
                    onChange={(e) => setWordsToAvoid(e.target.value)}
                    placeholder="e.g. Unfortunately, Esteemed, Kindly, Per our policy"
                    disabled={!canManage}
                    required
                  />
                </div>

                {canManage && (
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={savingVoice} className="gap-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white">
                      <Save className="h-4 w-4" />
                      <span>{savingVoice ? "Saving..." : "Save Brand Voice"}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
