"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LinkedAccount } from "@/types/database";

export function TransferForm() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [fromId, setFromId] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
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
    const res = await fetch("/api/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_account_id: fromId,
        to_account_number: to,
        amount: Number(amount),
        remark,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setStatus(data.error ?? "Failed");
    else setStatus(`Transfer submitted (${data.reference})`);
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
              {a.account_name} — {a.account_number}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>To account number</Label>
        <Input className="mt-1" value={to} onChange={(e) => setTo(e.target.value)} required />
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
        <Label>Remark</Label>
        <Input className="mt-1" value={remark} onChange={(e) => setRemark(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send transfer"}
      </Button>
      {status && <p className="text-sm text-brand-300">{status}</p>}
    </form>
  );
}
