"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, User as UserIcon, LogOut, Settings, Sparkles, Building2 } from "lucide-react";
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
import { AppSidebar } from "./AppSidebar";
import { Dialog } from "@/components/ui/dialog";

interface HeaderProps {
  userOrgs?: Array<{ id: string; name: string; slug: string; userRole: string }>;
}

export function Header({ userOrgs = [] }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Derive friendly page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/generate") return "Email Generator";
    if (pathname === "/reply") return "Reply Generator";
    if (pathname === "/improve") return "Improve Email";
    if (pathname === "/analyze") return "Email Analysis";
    if (pathname === "/humanize") return "Humanize Email";
    if (pathname === "/translate") return "Email Translation";
    if (pathname === "/templates") return "Template Library";
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
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="iconSm"
          className="md:hidden"
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-foreground tracking-tight sm:text-lg">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Daily 10 Generation limit pill */}
        <UsagePill />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 p-0 text-primary font-bold text-xs border border-primary/20"
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
              <p className="text-sm font-semibold leading-none text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2 w-full">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/organization" className="flex items-center gap-2 w-full">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Organization</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 w-full">
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

      {/* Mobile Drawer */}
      <Dialog open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <div className="-m-6 p-2">
          <AppSidebar userOrgs={userOrgs} onNavigate={() => setMobileDrawerOpen(false)} />
        </div>
      </Dialog>
    </header>
  );
}
