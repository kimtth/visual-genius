"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, MessagesSquare, Settings, BookOpen, Keyboard } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/teach", label: "Teach", icon: BookOpen },
  { href: "/parent", label: "Communicate", icon: MessageCircle },
  { href: "/child", label: "Child", icon: MessagesSquare },
  { href: "/letterboard", label: "Letterboard", icon: Keyboard },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-brand shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-white hover:text-white/90 transition">
            🪅Visual Genius: Communication Assistant
          </Link>
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
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-white hover:bg-white/20 hover:text-white"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Navigation</DialogTitle>
          </DialogHeader>
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
          </nav>
        </DialogContent>
      </Dialog>

      <main className="mx-auto max-w-6xl px-6 py-10 min-h-screen">{children}</main>
    </div>
  );
}
