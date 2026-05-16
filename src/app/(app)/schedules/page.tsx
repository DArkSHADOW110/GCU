"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contact, LinkedAccount, ScheduledPayment } from "@/types/database";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scheduled payments</h1>
        <p className="text-slate-400">
          Monthly recurring bills — processed daily via cron at 09:00 UTC
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>New schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <div>
              <Label>Label</Label>
              <Input className="mt-1" value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div>
              <Label>Amount (LKR)</Label>
              <Input
                className="mt-1"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Day of month (1–28)</Label>
              <Input
                className="mt-1"
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
                  className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
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
                  className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
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
            <Button type="submit">Schedule payment</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-surface-border px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">
                {s.label}
                {!s.is_active && (
                  <span className="ml-2 text-xs text-slate-500">(paused)</span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                Day {s.day_of_month} · Next:{" "}
                {s.next_run_at ? formatDate(s.next_run_at) : "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-brand-300">
                {formatCurrency(Number(s.amount), s.currency)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleActive(s.id, s.is_active)}
              >
                {s.is_active ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
