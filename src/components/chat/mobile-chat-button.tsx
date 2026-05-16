"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { cn } from "@/lib/utils";

export function MobileChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow xl:hidden",
          open && "hidden"
        )}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && <ChatDrawer onClose={() => setOpen(false)} />}
    </>
  );
}

function ChatDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface xl:hidden">
      <div className="flex h-14 items-center justify-between border-b border-surface-border px-4">
        <p className="font-medium text-white">AI Assistant</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-surface-muted hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 p-4">
        <ChatPanel />
      </div>
    </div>
  );
}
