"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, HeroCard } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { LineChart, TrendingDown, Sparkles, Brain } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <LineChart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-text-primary">Expense Insights</h1>
          <p className="text-text-tertiary text-sm mt-1">AI analysis from transaction remarks (Groq)</p>
        </div>
      </div>

      {/* Total Spending Card */}
      <HeroCard className="p-6 max-w-md">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm font-medium text-text-tertiary">Total Spending (Debits & Bills)</span>
          </div>
          
          <p className="text-[2.5rem] font-bold text-text-primary tracking-tighter">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              formatCurrency(totalSpend)
            )}
          </p>
        </div>
      </HeroCard>

      {/* AI Analysis Card */}
      <Card>
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="block">AI Analysis</span>
              <span className="text-xs font-normal text-text-tertiary flex items-center gap-1 mt-0.5">
                <Sparkles className="h-3 w-3" /> Powered by Groq
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {loading ? (
            <div className="flex items-center gap-3 text-text-tertiary">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-sm">Generating insights...</span>
            </div>
          ) : analysis ? (
            <article className="prose prose-sm max-w-none whitespace-pre-wrap text-text-secondary leading-relaxed">
              {analysis}
            </article>
          ) : (
            <div className="text-center py-8 text-text-tertiary">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No analysis available yet. Add some transactions to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
