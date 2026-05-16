"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { LinkedAccount } from "@/types/database";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [providerHint, setProviderHint] = useState(
    "Sandbox mode — mock accounts until Seylan API keys are set"
  );
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [provider, setProvider] = useState("seylan");

  function load() {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.accounts ?? []);
        const p = d.accounts?.[0]?.provider;
        if (p === "seylan") setProviderHint("Connected via Seylan Bank API");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function sync() {
    setSyncing(true);
    await fetch("/api/accounts", { method: "POST" });
    load();
    setSyncing(false);
  }

  async function linkManual(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_name: accountName,
        account_number: accountNumber,
        provider,
      }),
    });
    setAccountName("");
    setAccountNumber("");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Linked accounts</h1>
          <p className="text-slate-400">{providerHint}</p>
        </div>
        <Button onClick={sync} disabled={syncing} variant="secondary">
          {syncing ? "Syncing…" : "Sync from bank"}
        </Button>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Link account manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={linkManual} className="space-y-3">
            <div>
              <Label>Account name</Label>
              <Input
                className="mt-1"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Account number</Label>
              <Input
                className="mt-1"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Bank / provider</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="seylan">Seylan Bank</option>
                <option value="mock">Other (sandbox)</option>
              </select>
            </div>
            <Button type="submit">Link account</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.account_name}</CardTitle>
              <p className="text-xs text-slate-500">
                {a.provider.toUpperCase()} · {a.account_type}
                {a.is_primary ? " · Primary" : ""}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(Number(a.balance), a.currency)}
              </p>
              <p className="mt-2 text-sm text-slate-400">{a.account_number}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
