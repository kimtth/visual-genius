"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, MessageCircle, MessagesSquare, Settings, BookOpen, Keyboard, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/state/authStore";
import { useSessionStore } from "@/lib/state/sessionStore";

const links = [
  { href: "/teach", label: "Teach", icon: BookOpen },
  { href: "/parent", label: "Communicate", icon: MessageCircle },
  { href: "/child", label: "Child", icon: MessagesSquare },
  { href: "/letterboard", label: "Letterboard", icon: Keyboard },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuthStore();
  const { reset: resetSession } = useSessionStore();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      signOut();
      resetSession(); // Clear session state on sign out
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Hide navigation on home/auth page
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-brand shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href={isAuthenticated ? "/teach" : "/"} className="text-lg font-semibold text-white hover:text-white/90 transition">
            🪅Visual Genius: Communication Assistant
          </Link>
          
          {!isHomePage && isAuthenticated && (
            <>
              <nav className="hidden gap-2 sm:flex">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-white text-brand shadow-sm"
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 text-white text-sm">
                <User className="h-4 w-4" />
                <span>{user?.full_name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/20 hover:text-white"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </>
          )}
        </div>
      </header>

      {!isHomePage && isAuthenticated && (
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Navigation</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center gap-2 text-slate-700 px-4 py-2 bg-slate-50 rounded-lg">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.full_name}</span>
            </div>

            <nav className="flex flex-col gap-2 mt-4">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-brand text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  setIsMobileOpen(false);
                  handleSignOut();
                }}
                className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </nav>
          </DialogContent>
        </Dialog>
      )}

      <main className="mx-auto max-w-6xl px-6 py-10 min-h-screen">{children}</main>
    </div>
  );
}
