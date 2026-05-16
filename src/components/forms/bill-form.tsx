"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LinkedAccount } from "@/types/database";

export function BillForm() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [fromId, setFromId] = useState("");
  const [biller, setBiller] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
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
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_account_id: fromId,
        biller_account: biller,
        amount: Number(amount),
        reference,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setStatus(data.error ?? "Failed");
    else setStatus(`Bill paid (${data.reference})`);
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <div>
        <Label>From account</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.account_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Biller account number</Label>
        <Input className="mt-1" value={biller} onChange={(e) => setBiller(e.target.value)} required />
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
        <Label>Reference</Label>
        <Input className="mt-1" value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Paying…" : "Pay bill"}
      </Button>
      {status && <p className="text-sm text-brand-300">{status}</p>}
    </form>
  );
}
