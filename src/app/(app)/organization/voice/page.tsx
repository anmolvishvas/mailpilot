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
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Link href="/organization">
          <Button variant="ghost" size="iconSm" className="rounded-lg h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Brand Voice & Company Tone</h1>
            <p className="text-xs text-muted-foreground">Standardize writing tone and vocabulary across all organization emails.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl border border-border bg-card/60 animate-pulse" />
      ) : !selectedOrg ? (
        <Card className="rounded-xl border border-border p-12 text-center">
          <p className="text-xs text-muted-foreground">Please create or select an organization first.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Company Tone */}
          <Card className="rounded-xl border border-border bg-card">
            <form onSubmit={handleSaveCompanyTone}>
              <CardHeader className="p-5 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">Company Writing Tone</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    Active
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  The overarching tone of voice incorporated when members generate emails for {selectedOrg.name}.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Tone Description</label>
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
                  <label className="text-xs font-medium text-foreground">Special Rules / Signing Off</label>
                  <Input
                    value={companyToneRules}
                    onChange={(e) => setCompanyToneRules(e.target.value)}
                    placeholder="e.g. Sign off as 'The Acme Team'. Always offer next steps."
                    disabled={!canManage}
                  />
                </div>

                {canManage && (
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={savingTone} className="gap-2 rounded-lg font-medium text-xs h-9">
                      <Save className="h-3.5 w-3.5" />
                      <span>{savingTone ? "Saving..." : "Save Company Tone"}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </form>
          </Card>

          {/* Section 2: Brand Voice Preferences */}
          <Card className="rounded-xl border border-border bg-card">
            <form onSubmit={handleSaveBrandVoice}>
              <CardHeader className="p-5 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-semibold">Brand Voice Guidelines</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    Vocabulary
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure brand personality traits, preferred vocabulary, and phrases to avoid.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Brand Personality</label>
                  <Input
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="e.g. Friendly, Confident, Innovative, Responsive"
                    disabled={!canManage}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Words to Use</label>
                  <Input
                    value={wordsToUse}
                    onChange={(e) => setWordsToUse(e.target.value)}
                    placeholder="e.g. Customer, Partner, Team, Solution, Delight"
                    disabled={!canManage}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Words to Avoid</label>
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
                    <Button type="submit" disabled={savingVoice} className="gap-2 rounded-lg font-medium text-xs h-9">
                      <Save className="h-3.5 w-3.5" />
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
