"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi! I'm your FinPulse assistant. I can help with transfers, bills, mobile top-up, jars, contacts, schedules, and spending insights. What would you like to do?",
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        const history = (d.messages ?? []) as Message[];
        if (history.length > 0) setMessages(history);
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-[0_0_20px_var(--primary-glow)]">
            <Sparkles className="h-5 w-5 text-black" />
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-xl bg-primary/30 animate-pulse-glow" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">AI Assistant</p>
            <p className="text-[0.6875rem] text-text-tertiary">Powered by Groq</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {!historyLoaded && (
          <p className="text-xs text-text-tertiary animate-pulse">Loading chat history...</p>
        )}
        {messages.map((m, i) => (
          <ChatMessageRow key={i} message={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-text-tertiary">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs">Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-2 p-1 pl-4 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-[var(--primary-glow)]">
          <input
            placeholder="Ask me to transfer, pay a bill, or check jars..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              "bg-gradient-to-br from-primary to-primary-light text-black",
              "shadow-[0_0_12px_var(--primary-glow)]",
              "transition-all duration-200",
              "hover:scale-105 hover:shadow-[0_0_20px_var(--primary-glow)]",
              "disabled:opacity-50 disabled:hover:scale-100"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessageRow({ message: m }: { message: Message }) {
  const isUser = m.role === "user";
  
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
          isUser
            ? "bg-[var(--ai-user-bubble)] text-[var(--ai-user-bubble-text)] rounded-br-sm"
            : "bg-[var(--ai-assistant-bubble)] border border-[var(--ai-assistant-bubble-border)] text-text-primary rounded-bl-sm"
        )}
      >
        {m.content}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--input-bg)] border border-[var(--border)]">
          <User className="h-4 w-4 text-text-tertiary" />
        </div>
      )}
    </div>
  );
}
