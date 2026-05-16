"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { LinkedAccount } from "@/types/database";
import { RefreshCw, Plus, Wallet, Building2, Star } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-text-primary">Linked Accounts</h1>
          <p className="text-text-tertiary text-sm mt-1">{providerHint}</p>
        </div>
        <Button onClick={sync} disabled={syncing} variant="secondary" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync from bank"}
        </Button>
      </div>

      {/* Link Account Form */}
      <Card className="max-w-md">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Link account manually
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={linkManual} className="space-y-4">
            <div>
              <Label>Account name</Label>
              <Input
                className="mt-2"
                placeholder="e.g. Personal Savings"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Account number</Label>
              <Input
                className="mt-2"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Bank / provider</Label>
              <select
                className="mt-2 flex h-10 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-text-primary transition-all focus:border-primary focus:ring-2 focus:ring-[var(--primary-glow)]"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="seylan">Seylan Bank</option>
                <option value="mock">Other (sandbox)</option>
              </select>
            </div>
            <Button type="submit" className="w-full">Link account</Button>
          </form>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <Card key={a.id} className="group hover:shadow-[0_0_30px_var(--cyber-cyan-glow)] transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{a.account_name}</CardTitle>
                    <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {a.provider.toUpperCase()} · {a.account_type}
                    </p>
                  </div>
                </div>
                {a.is_primary && (
                  <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3" /> Primary
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary tracking-tight">
                {formatCurrency(Number(a.balance), a.currency)}
              </p>
              <p className="mt-2 text-sm text-text-tertiary font-mono tracking-[0.1em]">{a.account_number}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
