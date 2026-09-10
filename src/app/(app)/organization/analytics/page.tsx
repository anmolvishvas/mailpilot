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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/organization">
            <Button variant="ghost" size="iconSm" className="rounded-lg h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Usage Analytics</h1>
              <p className="text-xs text-muted-foreground">Privacy-respecting aggregate generation metrics for your team.</p>
            </div>
          </div>
        </div>

        {orgs.length > 1 && (
          <select
            value={selectedOrgId}
            onChange={(e) => handleSelectOrg(e.target.value)}
            className="h-9 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 p-3.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
        <span>
          <strong className="text-foreground font-medium">Privacy Guaranteed:</strong> Organization analytics display aggregate counts and feature distributions only. Private email contents and drafts are never stored or shared with team administrators.
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : !analytics ? (
        <Card className="rounded-xl border border-border p-12 text-center">
          <p className="text-xs text-muted-foreground">No analytics data available for this organization.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Total Generations
                </span>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {analytics.totalGenerations}
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Across all team members
              </span>
            </Card>

            <Card className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Active Team Members
                </span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground mt-2">
                {analytics.memberCount || 1}
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Members in organization
              </span>
            </Card>

            <Card className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Subscription Cost
                </span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground mt-2">
                $0.00
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Free Forever
              </span>
            </Card>
          </div>

          {/* Feature Distribution */}
          <Card className="rounded-xl border border-border bg-card p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-semibold">Feature Usage Distribution</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Breakdown of AI capabilities utilized by your team
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {[
                  { name: "Generate", key: "GENERATE", icon: Sparkles },
                  { name: "Reply", key: "REPLY", icon: Send },
                  { name: "Improve", key: "IMPROVE", icon: Wand2 },
                  { name: "Analyze", key: "ANALYZE", icon: BarChart3 },
                  { name: "Humanize", key: "HUMANIZE", icon: Bot },
                  { name: "Translate", key: "TRANSLATE", icon: Languages },
                  { name: "Templates", key: "TEMPLATE", icon: FileText },
                ].map((feat) => {
                  const Icon = feat.icon;
                  const count = analytics.featureBreakdown?.[feat.key] || 0;
                  return (
                    <div
                      key={feat.key}
                      className="flex flex-col items-center justify-center rounded-lg border border-border bg-secondary/30 p-3 text-center"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="text-base font-bold text-foreground">{count}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">{feat.name}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Daily Trend (Last 7 Days) */}
          <Card className="rounded-xl border border-border bg-card p-5">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-semibold">Activity Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="flex items-end justify-between gap-2 h-36 pt-4">
                {analytics.dailyTrends?.map((d: any) => {
                  const max = Math.max(...analytics.dailyTrends.map((t: any) => t.count), 1);
                  const heightPct = Math.max(8, Math.round((d.count / max) * 100));
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-semibold text-foreground">{d.count}</span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[32px] rounded-t bg-primary transition-all"
                      />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center font-mono">
                        {d.date.split("-").slice(1).join("/")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Member Usage Distribution (Aggregated Counts Only) */}
          <Card className="rounded-xl border border-border bg-card overflow-hidden">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle className="text-sm font-semibold">Member Generation Usage</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Aggregate count of successful AI generations per member
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {analytics.memberUsage?.map((m: any) => (
                  <div key={m.memberId} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground font-semibold text-xs border border-border">
                        {m.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">{m.name}</span>
                        <span className="text-[11px] text-muted-foreground">{m.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Badge variant="secondary" className="text-xs">
                        {m.totalGenerations} generation(s)
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
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
