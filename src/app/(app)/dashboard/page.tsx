"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { LinkedAccount, Transaction } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Receipt } from "lucide-react";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []));
    fetch("/api/transactions?limit=5")
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Your unified banking overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-brand-900/50 to-surface-card">
          <CardHeader>
            <CardTitle className="text-slate-300 text-sm font-normal">Total balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalBalance)}</p>
            <p className="mt-1 text-sm text-slate-500">
              Across {accounts.length} linked account{accounts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/send">
              <Button variant="secondary" className="w-full justify-start">
                <Send className="h-4 w-4" /> Send money
              </Button>
            </Link>
            <Link href="/bills">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="h-4 w-4" /> Pay bill
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Accounts</CardTitle>
            <Link href="/accounts">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg bg-surface-muted/50 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-white">{a.account_name}</p>
                  <p className="text-xs text-slate-500">{a.account_number}</p>
                </div>
                <p className="font-semibold text-brand-300">
                  {formatCurrency(Number(a.balance), a.currency)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between text-sm">
                <div>
                  <p className="text-white">{t.counterparty ?? t.remark}</p>
                  <p className="text-xs text-slate-500">{t.remark}</p>
                </div>
                <p
                  className={
                    t.type === "credit" ? "text-emerald-400" : "text-slate-300"
                  }
                >
                  {t.type === "credit" ? "+" : "-"}
                  {formatCurrency(Number(t.amount), t.currency)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
