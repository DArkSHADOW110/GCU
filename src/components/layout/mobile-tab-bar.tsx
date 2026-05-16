"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/send", label: "Send", icon: Send },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <nav className="flex justify-around items-center h-16 px-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all duration-200 active:scale-95",
                isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "text-slate-400 hover:text-white"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
