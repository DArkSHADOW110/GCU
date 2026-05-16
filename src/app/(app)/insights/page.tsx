"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function InsightsPage() {
  const [totalSpend, setTotalSpend] = useState(0);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/expense-analysis")
      .then((r) => r.json())
      .then((d) => {
        setTotalSpend(d.totalSpend ?? 0);
        setAnalysis(d.analysis ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Expense insights</h1>
        <p className="text-slate-400">AI analysis from transaction remarks (Groq)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total spending (debits & bills)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">
            {loading ? "…" : formatCurrency(totalSpend)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Generating insights…</p>
          ) : (
            <article className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300">
              {analysis}
            </article>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
