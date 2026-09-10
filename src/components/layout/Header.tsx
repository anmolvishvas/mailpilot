"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings,
  Sparkles,
  Building2,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsagePill } from "./UsagePill";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userOrgs?: Array<{ id: string; name: string; slug: string; userRole: string }>;
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

export function Header({ userOrgs = [] }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Close drawer on path change
  React.useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  React.useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileDrawerOpen]);

  // Derive friendly page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/generate") return "Email Generator";
    if (pathname === "/reply") return "Reply Generator";
    if (pathname === "/improve") return "Improve Email";
    if (pathname === "/analyze") return "Email Analysis";
    if (pathname === "/humanize") return "Humanize Email";
    if (pathname === "/translate") return "Email Translation";
    if (pathname === "/templates") return "Templates";
    if (pathname === "/history") return "Saved History";
    if (pathname === "/tones") return "Custom Tones";
    if (pathname.startsWith("/organization")) return "Organization";
    if (pathname === "/settings") return "Settings";
    return "MailPilot";
  };

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-3 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0 rounded-xl"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page Title */}
          <div className="flex items-center gap-2 truncate">
            <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight truncate">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Daily 10 Generation limit pill */}
          <UsagePill />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full bg-secondary hover:bg-muted p-0 text-foreground font-medium text-xs border border-border shrink-0"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials || "U"}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-semibold leading-none text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 w-full cursor-pointer">
                  <Sparkles className="h-4 w-4 text-foreground" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/organization" className="flex items-center gap-2 w-full cursor-pointer">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>Organization</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 w-full cursor-pointer">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-50 flex h-full w-[260px] max-w-[85vw] flex-col justify-between border-r border-border bg-card p-3 shadow-lg animate-in slide-in-from-left duration-200">
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-1 pt-1 pb-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-2 font-semibold text-foreground"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">MailPilot</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation links */}
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
                        onClick={() => setMobileDrawerOpen(false)}
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

              {/* Org Nav Links */}
              <div>
                <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                  Organization
                </div>
                <nav className="flex flex-col gap-0.5">
                  {orgNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileDrawerOpen(false)}
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

            {/* Bottom links */}
            <div className="pt-2 border-t border-border flex flex-col gap-0.5">
              <Link
                href="/settings"
                onClick={() => setMobileDrawerOpen(false)}
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
          </div>
        </div>
      )}
    </>
  );
}
