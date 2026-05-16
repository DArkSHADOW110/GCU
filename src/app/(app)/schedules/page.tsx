"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contact, LinkedAccount, ScheduledPayment } from "@/types/database";
import { CalendarClock, Plus, Play, Pause, Calendar } from "lucide-react";

export default function SchedulesPage() {
  const [items, setItems] = useState<ScheduledPayment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [contactId, setContactId] = useState("");
  const [accountId, setAccountId] = useState("");

  function load() {
    fetch("/api/scheduled-payments")
      .then((r) => r.json())
      .then((d) => setItems(d.scheduled_payments ?? []));
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((d) => setContacts((d.contacts ?? []).filter((c: Contact) => c.contact_type === "bill")));
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        const list = d.accounts ?? [];
        setAccounts(list);
        if (list[0]) setAccountId(list[0].id);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/scheduled-payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        amount: Number(amount),
        day_of_month: Number(day),
        contact_id: contactId || null,
        linked_account_id: accountId || null,
      }),
    });
    setLabel("");
    setAmount("");
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/scheduled-payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    });
    load();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <CalendarClock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-text-primary">Scheduled Payments</h1>
          <p className="text-text-tertiary text-sm mt-1">Monthly recurring bills — processed daily via cron at 09:00 UTC</p>
        </div>
      </div>

      {/* Create Schedule Form */}
      <Card className="max-w-md">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            New Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={create} className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input 
                className="mt-2" 
                placeholder="e.g. Electricity Bill"
                value={label} 
                onChange={(e) => setLabel(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label>Amount (LKR)</Label>
              <Input
                className="mt-2"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Day of month (1–28)
              </Label>
              <Input
                className="mt-2"
                type="number"
                min={1}
                max={28}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                required
              />
            </div>
            {contacts.length > 0 && (
              <div>
                <Label>Bill contact (optional)</Label>
                <select
                  className="mt-2 flex h-10 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-text-primary transition-all focus:border-primary focus:ring-2 focus:ring-[var(--primary-glow)]"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                >
                  <option value="">None</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} — {c.account_number}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {accounts.length > 0 && (
              <div>
                <Label>Pay from account</Label>
                <select
                  className="mt-2 flex h-10 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-text-primary transition-all focus:border-primary focus:ring-2 focus:ring-[var(--primary-glow)]"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button type="submit" className="w-full">Schedule payment</Button>
          </form>
        </CardContent>
      </Card>

      {/* Scheduled Payments List */}
      <div className="space-y-3">
        {items.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] backdrop-blur-[24px] px-5 py-4 hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${s.is_active ? 'bg-primary/10 text-primary' : 'bg-[var(--input-bg)] text-text-tertiary'}`}>
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-text-primary flex items-center gap-2">
                  {s.label}
                  {!s.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--input-bg)] text-text-tertiary">
                      Paused
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Day {s.day_of_month} · Next: {s.next_run_at ? formatDate(s.next_run_at) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-primary tabular-nums">
                {formatCurrency(Number(s.amount), s.currency)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive(s.id, s.is_active)}
                className={s.is_active ? "text-text-tertiary hover:text-destructive" : "text-success hover:text-success"}
              >
                {s.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-text-tertiary">
            <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No scheduled payments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
