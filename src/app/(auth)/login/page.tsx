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
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-2xl">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-400 text-white shadow-md shadow-primary/25">
              <Mail className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">MailPilot</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign in to access your free AI email assistant
          </p>
        </div>

        {/* 1-Click Demo Login */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Demo Account</span>
            </span>
            <Badge variant="success" className="text-[10px]">
              Ready
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Test the full application instantly with our pre-configured demo user (Alex Morgan).
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full gap-2 rounded-xl text-xs font-semibold shadow-sm"
          >
            <UserCheck className="h-4 w-4" />
            <span>{demoLoading ? "Signing in..." : "1-Click Demo Sign In"}</span>
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase">
            Or sign in with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
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
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
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

          <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}
