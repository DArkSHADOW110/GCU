"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
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
          "fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)] active:scale-95 transition-all duration-300 md:hidden",
          open && "hidden"
        )}
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col h-[85vh] bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-t-3xl border-t border-white/10 shadow-2xl md:hidden animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
            <div className="flex h-12 items-center justify-between px-6 border-b border-white/5">
              <p className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" /> AI Assistant
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors active:scale-95"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden relative">
              <ChatPanel />
            </div>
          </div>
        </>
      )}
    </>
  );
}
