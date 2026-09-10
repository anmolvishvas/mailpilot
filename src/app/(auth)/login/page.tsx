"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowRight, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        error(res.error || "Invalid email or password");
      } else {
        success("Signed in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      error(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await signIn("credentials", {
        email: "demo@mailpilot.app",
        password: "demo12345",
        redirect: false,
      });

      if (res?.error) {
        error("Could not log into demo account");
      } else {
        success("Logged in as Demo User!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      error("Demo login error");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MailPilot</span>
          </Link>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign in to access your free AI email assistant
          </p>
        </div>

        {/* 1-Click Demo Login */}
        <div className="rounded-lg border border-border bg-secondary/40 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Instant Demo Account</span>
            </span>
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
              Ready
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Test the full application instantly with our pre-configured demo user (Alex Morgan).
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full gap-2 rounded-lg text-xs font-medium h-8 bg-card hover:bg-secondary"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{demoLoading ? "Signing in..." : "1-Click Demo Sign In"}</span>
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Or continue with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-lg font-medium text-xs h-9">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
