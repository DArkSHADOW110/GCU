"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Jar } from "@/types/database";
import { PiggyBank, Plus, Target, Coins } from "lucide-react";

export default function JarsPage() {
  const [jars, setJars] = useState<Jar[]>([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  function load() {
    fetch("/api/jars")
      .then((r) => r.json())
      .then((d) => setJars(d.jars ?? []));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/jars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        target_amount: target ? Number(target) : null,
      }),
    });
    setName("");
    setTarget("");
    load();
  }

  async function fund(id: string) {
    const amount = prompt("Amount to allocate (LKR):");
    if (!amount) return;
    await fetch(`/api/jars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fund_amount: Number(amount) }),
    });
    load();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <PiggyBank className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-text-primary">Savings Jars</h1>
          <p className="text-text-tertiary text-sm mt-1">Virtual goals — logical buckets on your balance</p>
        </div>
      </div>

      {/* Create Jar Form */}
      <Card className="max-w-md">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            New Jar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={create} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                className="mt-2" 
                placeholder="e.g. Vacation Fund"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5" />
                Target amount (optional)
              </Label>
              <Input
                className="mt-2"
                type="number"
                placeholder="0.00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Create jar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Jars Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jars.map((j) => {
          const progress = j.target_amount ? (Number(j.balance) / Number(j.target_amount)) * 100 : null;
          return (
            <Card key={j.id} className="group hover:shadow-[0_0_30px_var(--cyber-cyan-glow)] transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-lg"
                      style={{ 
                        backgroundColor: j.color ? `${j.color}20` : 'var(--primary-glow)',
                        color: j.color || 'var(--primary)'
                      }}
                    >
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{j.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-primary tracking-tight">
                    {formatCurrency(Number(j.balance))}
                  </p>
                  {j.target_amount != null && (
                    <p className="text-sm text-text-tertiary mt-1 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Goal: {formatCurrency(Number(j.target_amount))}
                    </p>
                  )}
                </div>
                
                {/* Progress bar */}
                {progress !== null && (
                  <div className="space-y-1.5">
                    <div className="h-2 bg-[var(--input-bg)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-tertiary text-right">{progress.toFixed(1)}% complete</p>
                  </div>
                )}
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => fund(j.id)}
                  className="w-full gap-2"
                >
                  <Coins className="h-4 w-4" />
                  Add funds
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {jars.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-tertiary">
            <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No jars created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
