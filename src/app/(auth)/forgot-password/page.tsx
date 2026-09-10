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
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">MailPilot</span>
          </Link>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Reset your password
          </h2>
          <p className="text-xs text-muted-foreground">
            Enter your email and we'll send you recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg border border-border bg-secondary/40 p-5 text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-foreground" />
            <h3 className="text-xs font-semibold text-foreground">Check your inbox</h3>
            <p className="text-xs text-muted-foreground">
              We've sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Link href="/login" className="mt-2">
              <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-lg font-medium text-xs h-9">
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
