"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      success("Password reset instructions sent to your email!");
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-blue-400 text-white shadow-md shadow-primary/25">
              <Mail className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">MailPilot</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Reset your password
          </h2>
          <p className="text-xs text-muted-foreground">
            Enter your email and we'll send you recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <h3 className="text-sm font-bold text-foreground">Check your inbox</h3>
            <p className="text-xs text-muted-foreground">
              We've sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="mt-3">
              <Button variant="outline" size="sm" className="rounded-xl">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-xl font-bold">
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
