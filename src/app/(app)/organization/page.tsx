"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Plus,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Trash2,
  FolderLock,
  Volume2,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function OrganizationPage() {
  const { success, error } = useToast();

  const [orgs, setOrgs] = React.useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Create Org Modal
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState("");
  const [newOrgSlug, setNewOrgSlug] = React.useState("");
  const [newOrgDesc, setNewOrgDesc] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Invite Member Modal
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviting, setInviting] = React.useState(false);

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
      error("Failed to fetch organization details");
    }
  };

  React.useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgSlug) return;

    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName.trim(),
          slug: newOrgSlug.trim().toLowerCase(),
          description: newOrgDesc.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create organization");
      }

      success("Organization created successfully!");
      setCreateModalOpen(false);
      fetchOrgs();
    } catch (err: any) {
      error(err.message || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !selectedOrg) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite member");
      }

      success(`Invited ${inviteEmail} to ${selectedOrg.name}!`);
      setInviteModalOpen(false);
      setInviteEmail("");
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      error(err.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!selectedOrg) return;
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      success("Member role updated");
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      error(err.message || "Failed to change role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg || !confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`/api/organizations/${selectedOrg.id}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }

      success("Member removed");
      fetchOrgDetails(selectedOrg.id);
    } catch (err: any) {
      error(err.message || "Failed to remove member");
    }
  };

  const isOwnerOrAdmin = selectedOrg?.currentUserRole === "OWNER" || selectedOrg?.currentUserRole === "ADMIN";
  const isOwner = selectedOrg?.currentUserRole === "OWNER";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Organization & Teams</h1>
            <p className="text-xs text-muted-foreground">Collaborate with shared templates, company voice & brand tone.</p>
          </div>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="gap-2 rounded-lg font-medium text-xs h-9">
          <Plus className="h-3.5 w-3.5" />
          <span>New Organization</span>
        </Button>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl border border-border bg-card/60 animate-pulse" />
      ) : orgs.length === 0 ? (
        <Card className="rounded-xl border border-border p-12 text-center flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Organization Found</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Create an organization to share templates, standardize writing style, and track team analytics.
          </p>
          <Button onClick={() => setCreateModalOpen(true)} className="mt-2 rounded-lg text-xs h-8">
            Create Free Organization
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Org Selector & Nav Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Org:</span>
              <select
                value={selectedOrg?.id || ""}
                onChange={(e) => fetchOrgDetails(e.target.value)}
                className="h-9 w-full sm:w-auto rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.userRole})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Links inside Organization */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
              <Link href="/organization/templates" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-xs h-8">
                  <FolderLock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Shared Templates</span>
                </Button>
              </Link>
              <Link href="/organization/voice" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-xs h-8">
                  <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Brand Voice</span>
                </Button>
              </Link>
              <Link href="/organization/analytics" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg text-xs h-8">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </div>
          </div>

          {selectedOrg && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Org Overview & Voice Preview */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <Card className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="space-y-1.5 pb-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                        {selectedOrg.currentUserRole} Role
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {selectedOrg.members?.length || 1} Member(s)
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{selectedOrg.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedOrg.description || "No description added."}
                    </p>
                  </div>

                  {/* Company Tone Snapshot */}
                  <div className="rounded-lg bg-secondary/40 border border-border p-3.5 space-y-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Active Company Tone</span>
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedOrg.companyTone?.description || "Clear, friendly, and professional."}
                    </p>
                  </div>

                  {/* Brand Voice Snapshot */}
                  <div className="rounded-lg bg-secondary/40 border border-border p-3.5 space-y-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Brand Voice Attributes</span>
                    </span>
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <div>
                        <span className="text-foreground font-medium">Personality:</span> {selectedOrg.brandVoice?.personality || "Friendly, Confident"}
                      </div>
                      <div>
                        <span className="text-foreground font-medium">Words to use:</span> {selectedOrg.brandVoice?.wordsToUse || "Partner, Team"}
                      </div>
                      <div>
                        <span className="text-foreground font-medium">Words to avoid:</span> {selectedOrg.brandVoice?.wordsToAvoid || "Unfortunately"}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Member Management & RBAC */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <Card className="rounded-xl border border-border bg-card overflow-hidden">
                  <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Team Members ({selectedOrg.members?.length || 0})</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Roles: Owner (Full control), Admin (Manage team & templates), Member (Use features)
                      </CardDescription>
                    </div>

                    {isOwnerOrAdmin && (
                      <Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-1.5 rounded-lg font-medium text-xs h-8">
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Invite Member</span>
                      </Button>
                    )}
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {selectedOrg.members?.map((m: any) => (
                        <div key={m.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground font-semibold text-xs border border-border">
                              {m.user?.name?.[0] || m.user?.email?.[0] || "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-foreground">
                                {m.user?.name || "Member"}
                              </span>
                              <span className="text-[11px] text-muted-foreground">{m.user?.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {isOwner && m.role !== "OWNER" ? (
                              <select
                                value={m.role}
                                onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              >
                                <option value="ADMIN">ADMIN</option>
                                <option value="MEMBER">MEMBER</option>
                              </select>
                            ) : (
                              <Badge
                                variant={m.role === "OWNER" ? "default" : "secondary"}
                                className="text-[10px] uppercase font-semibold"
                              >
                                {m.role}
                              </Badge>
                            )}

                            {isOwnerOrAdmin && m.role !== "OWNER" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMember(m.id)}
                                className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Org Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <form onSubmit={handleCreateOrg}>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Set up a shared team workspace for collaboration, company writing voice, and templates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Organization Name</label>
              <Input
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value);
                  if (!newOrgSlug) {
                    setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                  }
                }}
                placeholder="e.g. Acme Innovations"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Slug / Handle</label>
              <Input
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. acme-innovations"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description (Optional)</label>
              <Textarea
                value={newOrgDesc}
                onChange={(e) => setNewOrgDesc(e.target.value)}
                placeholder="Briefly describe your team or company..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} className="rounded-lg text-xs h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="rounded-lg text-xs h-9 font-medium">
              {creating ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <form onSubmit={handleInviteMember}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Invite a colleague to join <strong>{selectedOrg?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Member Email</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="MEMBER">MEMBER (Can use templates & company voice)</option>
                <option value="ADMIN">ADMIN (Can manage members & shared templates)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)} className="rounded-lg text-xs h-9">
              Cancel
            </Button>
            <Button type="submit" disabled={inviting} className="rounded-lg text-xs h-9 font-medium">
              {inviting ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
