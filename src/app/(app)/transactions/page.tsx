"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/database";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/transactions?limit=50")
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Transactions</h1>
        <p className="text-slate-400">Full activity history</p>
      </div>
      <div className="divide-y divide-surface-border rounded-xl border border-surface-border">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-white">{t.counterparty ?? t.type}</p>
              <p className="text-xs text-slate-500">
                {t.remark} · {formatDate(t.occurred_at)}
              </p>
            </div>
            <p className={t.type === "credit" ? "text-emerald-400" : "text-white"}>
              {t.type === "credit" ? "+" : "-"}
              {formatCurrency(Number(t.amount), t.currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
