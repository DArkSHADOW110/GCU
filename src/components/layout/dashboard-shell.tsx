"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { MobileChatButton } from "@/components/chat/mobile-chat-button";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-surface text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-surface-border px-6">
          <p className="text-sm text-slate-400">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </p>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
          <div className="hidden w-[380px] border-l border-surface-border p-4 xl:block">
            <ChatPanel />
          </div>
        </div>
      </div>
      <MobileChatButton />
    </div>
  );
}
