"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { Settings, User, Sliders, Shield, Save, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { standardTones, lengths } from "@/components/email/RecipientToneSelector";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { success, error } = useToast();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [defaultTone, setDefaultTone] = React.useState("professional");
  const [defaultLength, setDefaultLength] = React.useState("medium");
  const [defaultLanguage, setDefaultLanguage] = React.useState("en");
  const [customInstructions, setCustomInstructions] = React.useState("");

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingSecurity, setSavingSecurity] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/user/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.name || "");
          setEmail(data.email || "");
          setDefaultTone(data.defaultTone || "professional");
          setDefaultLength(data.defaultLength || "medium");
          setDefaultLanguage(data.defaultLanguage || "en");
          setCustomInstructions(data.customInstructions || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          defaultTone,
          defaultLength,
          defaultLanguage,
          customInstructions: customInstructions.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await update({ name: data.name });
      success("Profile and preferences saved!");
    } catch (err: any) {
      error(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error("New passwords do not match");
      return;
    }

    setSavingSecurity(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      error(err.message || "Failed to update password");
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings & Preferences</h2>
          <p className="text-xs text-muted-foreground">Manage your profile, writing defaults, AI custom instructions, and security.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile & Defaults Form */}
        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <form onSubmit={handleSaveProfile}>
            <CardHeader className="p-6 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Profile & Writing Defaults</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set default parameters used when composing emails and replies.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <Input value={email} disabled className="bg-muted/40 cursor-not-allowed opacity-75" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Tone</label>
                  <select
                    value={defaultTone}
                    onChange={(e) => setDefaultTone(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {standardTones.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Length</label>
                  <select
                    value={defaultLength}
                    onChange={(e) => setDefaultLength(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {lengths.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Default Language</label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
                  >
                    {languages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">
                  Custom AI Instructions (Global)
                </label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Always keep bullet points for next steps, prefer concise sentences, sign off as [Your Name]."
                  rows={3}
                />
                <p className="text-[11px] text-muted-foreground">
                  These instructions will be automatically provided to the AI during all generation requests.
                </p>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" disabled={savingProfile} className="gap-2 rounded-xl font-bold">
                  <Save className="h-4 w-4" />
                  <span>{savingProfile ? "Saving..." : "Save Preferences"}</span>
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        {/* Security / Password Form */}
        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <form onSubmit={handleSavePassword}>
            <CardHeader className="p-6 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Security & Password</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Update your account password or sign out from your active session.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="gap-2 text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>

                <Button
                  type="submit"
                  disabled={savingSecurity || !newPassword}
                  className="gap-2 rounded-xl font-bold"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingSecurity ? "Updating..." : "Update Password"}</span>
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
