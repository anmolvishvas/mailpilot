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
  Building2,
  FolderLock,
  Volume2,
  Settings,
  Flame,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  { name: "Brand Voice & Tone", href: "/organization/voice", icon: Volume2 },
  { name: "Analytics", href: "/organization/analytics", icon: BarChart3 },
];

export function AppSidebar({ userOrgs = [], className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const hasOrg = userOrgs.length > 0;

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r border-border/80 bg-card/60 backdrop-blur-md p-4 transition-all",
        className
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-400 text-white shadow-md shadow-primary/25">
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-none font-bold">MailPilot</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Free AI Email Assistant</span>
            </div>
          </Link>
          <Badge variant="success" className="text-[10px] px-2 py-0">
            100% Free
          </Badge>
        </div>

        {/* Navigation list */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Main Features */}
          <div>
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Email Studio
            </div>
            <nav className="flex flex-col gap-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Organization section - only shown when user belongs to an org or is creating one */}
          <div>
            <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>Organization</span>
              {hasOrg && (
                <span className="text-[10px] lowercase text-emerald-600 dark:text-emerald-400 font-normal">
                  {userOrgs[0].name.slice(0, 12)}
                </span>
              )}
            </div>
            <nav className="flex flex-col gap-1">
              {orgNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-border/60 flex flex-col gap-1">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
