"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
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
    <div className="flex h-full flex-col rounded-2xl border border-surface-border bg-surface-card/60">
      <div className="border-b border-surface-border px-4 py-3">
        <p className="font-medium text-white">AI Assistant</p>
        <p className="text-xs text-slate-500">Powered by Groq</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!historyLoaded && (
          <p className="text-xs text-slate-500 animate-pulse">Loading chat history…</p>
        )}
        {messages.map((m, i) => (
          <ChatMessageRow key={i} message={m} />
        ))}
        {loading && (
          <p className="text-xs text-slate-500 animate-pulse">Thinking…</p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-surface-border p-3">
        <Input
          placeholder="Ask me to transfer, pay a bill, or check jars…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading}
        />
        <Button size="icon" onClick={send} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChatMessageRow({ message: m }: { message: Message }) {
  return (
    <div
      className={cn(
        "flex gap-2",
        m.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {m.role === "assistant" && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/30">
          <Bot className="h-4 w-4 text-brand-300" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
          m.role === "user"
            ? "bg-brand-600 text-white"
            : "bg-surface-muted text-slate-200"
        )}
      >
        {m.content}
      </div>
      {m.role === "user" && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted">
          <User className="h-4 w-4 text-slate-400" />
        </div>
      )}
    </div>
  );
}
