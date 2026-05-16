"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, LinkedAccount } from "@/types/database";

export function TopupForm() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [fromId, setFromId] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("dialog");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        const list = d.accounts ?? [];
        setAccounts(list);
        if (list[0]) setFromId(list[0].id);
      });
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((d) =>
        setContacts((d.contacts ?? []).filter((c: Contact) => c.contact_type === "mobile"))
      );
  }, []);

  function pickContact(contactId: string) {
    const c = contacts.find((x) => x.id === contactId);
    if (c) setMobile(c.account_number);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_account_id: fromId,
        mobile_number: mobile,
        amount: Number(amount),
        provider,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setStatus(data.error ?? "Failed");
    else setStatus(`Top-up successful (${data.reference})`);
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      {contacts.length > 0 && (
        <div>
          <Label>Saved mobile contact</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
            defaultValue=""
            onChange={(e) => e.target.value && pickContact(e.target.value)}
          >
            <option value="">Select contact…</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} — {c.account_number}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <Label>From account</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.account_name} — {a.account_number}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Mobile number</Label>
        <Input
          className="mt-1"
          placeholder="07XXXXXXXX"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Amount (LKR)</Label>
        <Input
          className="mt-1"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Carrier</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="dialog">Dialog</option>
          <option value="mobitel">Mobitel</option>
          <option value="airtel">Airtel</option>
          <option value="hutch">Hutch</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Processing…" : "Top up"}
      </Button>
      {status && <p className="text-sm text-brand-300">{status}</p>}
    </form>
  );
}
