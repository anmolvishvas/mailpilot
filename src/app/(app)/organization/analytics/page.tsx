"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Sparkles,
  Users,
  Send,
  Wand2,
  Bot,
  Languages,
  FileText,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function OrganizationAnalyticsPage() {
  const { error } = useToast();

  const [orgs, setOrgs] = React.useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = React.useState<string>("");
  const [analytics, setAnalytics] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchOrgs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organizations");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data);
        if (data.length > 0) {
          setSelectedOrgId(data[0].id);
          fetchAnalytics(data[0].id);
        }
      }
    } catch {
      error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = async (orgId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      error("Failed to load organization analytics");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleSelectOrg = (id: string) => {
    setSelectedOrgId(id);
    fetchAnalytics(id);
  };

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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Usage Analytics</h2>
              <p className="text-xs text-muted-foreground">Privacy-respecting aggregate generation metrics for your team.</p>
            </div>
          </div>
        </div>

        {orgs.length > 1 && (
          <select
            value={selectedOrgId}
            onChange={(e) => handleSelectOrg(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-semibold"
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <span>
          <strong>Privacy Guaranteed:</strong> Organization analytics display aggregate counts and feature distributions only. Private email contents and drafts are never stored or shared with team administrators.
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl border border-border bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : !analytics ? (
        <Card className="rounded-3xl border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No analytics data available for this organization.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Generations
                </span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-2">
                {analytics.totalGenerations}
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Across all team members
              </span>
            </Card>

            <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Team Members
                </span>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-2">
                {analytics.memberCount || 1}
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Members in organization
              </span>
            </Card>

            <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Subscription Cost
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                $0.00
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                100% Free Forever
              </span>
            </Card>
          </div>

          {/* Feature Distribution */}
          <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Feature Usage Distribution</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Breakdown of AI capabilities utilized by your team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {[
                  { name: "Generate", key: "GENERATE", icon: Sparkles, color: "text-blue-500" },
                  { name: "Reply", key: "REPLY", icon: Send, color: "text-indigo-500" },
                  { name: "Improve", key: "IMPROVE", icon: Wand2, color: "text-amber-500" },
                  { name: "Analyze", key: "ANALYZE", icon: BarChart3, color: "text-emerald-500" },
                  { name: "Humanize", key: "HUMANIZE", icon: Bot, color: "text-rose-500" },
                  { name: "Translate", key: "TRANSLATE", icon: Languages, color: "text-cyan-500" },
                  { name: "Templates", key: "TEMPLATE", icon: FileText, color: "text-purple-500" },
                ].map((feat) => {
                  const Icon = feat.icon;
                  const count = analytics.featureBreakdown?.[feat.key] || 0;
                  return (
                    <div
                      key={feat.key}
                      className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-muted/20 p-4 text-center"
                    >
                      <Icon className={`h-5 w-5 ${feat.color} mb-1.5`} />
                      <span className="text-lg font-bold text-foreground">{count}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">{feat.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily Trend (Last 7 Days) */}
          <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold">Activity Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="flex items-end justify-between gap-2 h-40 pt-4">
                {analytics.dailyTrends?.map((d: any) => {
                  const max = Math.max(...analytics.dailyTrends.map((t: any) => t.count), 1);
                  const heightPct = Math.max(10, Math.round((d.count / max) * 100));
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-bold text-foreground">{d.count}</span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-primary/60 to-primary transition-all shadow-sm"
                      />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                        {d.date.split("-").slice(1).join("/")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Member Usage Distribution (Aggregated Counts Only) */}
          <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="p-6 border-b border-border/60">
              <CardTitle className="text-base font-bold">Member Generation Usage</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Aggregate count of successful AI generations per member
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {analytics.memberUsage?.map((m: any) => (
                  <div key={m.memberId} className="flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {m.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {m.totalGenerations} generation(s)
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {m.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
