"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Mail,
  Send,
  Wand2,
  BarChart3,
  Bot,
  Languages,
  FileText,
  History,
  Sliders,
  Users,
  FolderLock,
  Volume2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  userOrgs?: Array<{ id: string; name: string; slug: string; userRole: string }>;
  className?: string;
  onNavigate?: () => void;
}

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Sparkles },
  { name: "Generate", href: "/generate", icon: Mail },
  { name: "Reply", href: "/reply", icon: Send },
  { name: "Improve", href: "/improve", icon: Wand2 },
  { name: "Analyze", href: "/analyze", icon: BarChart3 },
  { name: "Humanize", href: "/humanize", icon: Bot },
  { name: "Translate", href: "/translate", icon: Languages },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "History", href: "/history", icon: History },
  { name: "My Tones", href: "/tones", icon: Sliders },
];

const orgNavItems = [
  { name: "Team & Members", href: "/organization", icon: Users },
  { name: "Shared Templates", href: "/organization/templates", icon: FolderLock },
  { name: "Brand Voice", href: "/organization/voice", icon: Volume2 },
  { name: "Analytics", href: "/organization/analytics", icon: BarChart3 },
];

export function AppSidebar({ userOrgs = [], className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const hasOrg = userOrgs.length > 0;

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col justify-between border-r border-border bg-card p-3 transition-all",
        className
      )}
    >
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">MailPilot</span>
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
            v1.0
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-0.5">
          {/* Main Features */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Studio
            </div>
            <nav className="flex flex-col gap-0.5">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Organization section */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              <span>Organization</span>
              {hasOrg && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                  {userOrgs[0].name}
                </span>
              )}
            </div>
            <nav className="flex flex-col gap-0.5">
              {orgNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-2 border-t border-border flex flex-col gap-0.5">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            pathname === "/settings"
              ? "bg-secondary text-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
