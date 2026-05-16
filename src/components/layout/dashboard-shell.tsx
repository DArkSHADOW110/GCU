"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { MobileChatButton } from "@/components/chat/mobile-chat-button";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-[#0a0d14] text-slate-100 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0d14] via-[#0d1220] to-[#0a0d14]" />
      
      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#00e5ff]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00e5ff]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00e5ff" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b border-white/[0.04] backdrop-blur-xl bg-[#0a0d14]/60 px-4 md:px-6">
            <p className="text-lg md:text-sm font-semibold md:font-normal text-white md:text-slate-400 truncate max-w-[200px] md:max-w-full">
              Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
            </p>
            <Button variant="ghost" size="icon" md-size="sm" onClick={() => signOut({ callbackUrl: "/login" })} className="md:w-auto md:px-3 hover:bg-white/[0.04] hover:text-white transition-all">
              <LogOut className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </header>
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">{children}</main>
            <div className="hidden w-[380px] border-l border-white/[0.06] backdrop-blur-xl bg-[rgba(10,15,25,0.7)] p-4 xl:block">
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
      <MobileTabBar />
      <MobileChatButton />
    </div>
  );
}
