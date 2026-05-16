"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  CalendarClock,
  Contact,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Receipt,
  Send,
  Wallet,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/send", label: "Send", icon: Send },
  { href: "/receive", label: "Receive", icon: ArrowLeftRight },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/topup", label: "Top-up", icon: Smartphone },
  { href: "/jars", label: "Jars", icon: PiggyBank },
  { href: "/contacts", label: "Contacts", icon: Contact },
  { href: "/schedules", label: "Schedules", icon: CalendarClock },
  { href: "/insights", label: "Insights", icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-full w-64 flex-col border-r border-surface-border bg-surface/95 p-4">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">FinPulse</p>
          <p className="text-xs text-slate-500">Next-gen banking</p>
        </div>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
              pathname === href
                ? "bg-brand-600/20 text-brand-300"
                : "text-slate-400 hover:bg-surface-muted hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
