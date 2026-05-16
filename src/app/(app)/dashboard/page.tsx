"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { LinkedAccount, Transaction } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Receipt, Activity, Wallet, CreditCard } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white/90 drop-shadow-md">Overview</h1>
        <p className="text-slate-400 text-sm font-medium">Your unified financial command center</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-slate-300 text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-cyan-400" />
              Total Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter">
              {formatCurrency(totalBalance)}
            </p>
            <p className="mt-2 text-sm text-cyan-400/80 font-medium flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Across {accounts.length} linked account{accounts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/send">
              <Button className="w-full justify-start bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 border-none">
                <Send className="h-4 w-4 mr-2" /> Quick Transfer
              </Button>
            </Link>
            <Link href="/bills">
              <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/10 text-slate-200 transition-all duration-300">
                <Receipt className="h-4 w-4 mr-2 text-cyan-400" /> Pay a Bill
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 pb-8">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 px-4 md:px-6">
            <CardTitle className="text-lg font-medium text-white/90">Connected Accounts</CardTitle>
            <Link href="/accounts">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 px-0 md:px-6">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-4 px-4 md:px-0">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="snap-center shrink-0 w-[280px] group flex flex-col justify-between rounded-2xl bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 px-5 py-5 transition-all duration-300 active:scale-95 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/20 blur-2xl rounded-full" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="p-2 rounded-lg bg-black/40 text-cyan-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">{a.provider || 'Bank'}</span>
                  </div>
                  <div className="relative z-10">
                    <p className="font-bold text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                      {formatCurrency(Number(a.balance), a.currency)}
                    </p>
                    <p className="font-medium text-white/80 mt-1">{a.account_name}</p>
                    <p className="text-xs text-white/40 font-mono mt-0.5 tracking-widest">{a.account_number}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 px-4 md:px-6">
            <CardTitle className="text-lg font-medium text-white/90">Recent Pulse</CardTitle>
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 active:scale-95 transition-all">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-0 pt-2 px-2 md:px-6">
            {transactions.slice(0, 4).map((t) => (
              <div key={t.id} className="flex justify-between items-center text-sm py-3 px-3 min-h-[56px] rounded-xl hover:bg-white/5 transition-colors duration-200 border-b border-white/5 last:border-0 active:scale-[0.98]">
                <div className="flex flex-col justify-center">
                  <span className="text-white/90 font-medium text-base md:text-sm">{t.counterparty ?? t.remark}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{t.remark}</span>
                </div>
                <div className="text-right flex items-center">
                  <p
                    className={
                      t.type === "credit" ? "text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.3)] text-base" : "text-slate-300 font-medium text-base"
                    }
                  >
                    {t.type === "credit" ? "+" : "-"}
                    {formatCurrency(Number(t.amount), t.currency)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
