import type React from "react";
import { cn } from "./ui";

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-paper text-ink">{children}</div>
);

export const Sidebar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-navy px-4 py-5 text-white lg:block", className)}>
    {children}
  </aside>
);

export const Header = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <header className={cn("sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur lg:px-8", className)}>
    {children}
  </header>
);
