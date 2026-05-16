"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import type { Jar } from "@/types/database";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Savings jars</h1>
        <p className="text-slate-400">Virtual goals — logical buckets on your balance</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>New jar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Target (optional)</Label>
              <Input
                className="mt-1"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <Button type="submit">Create jar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jars.map((j) => (
          <Card key={j.id} style={{ borderColor: j.color }}>
            <CardHeader>
              <CardTitle>{j.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{formatCurrency(Number(j.balance))}</p>
              {j.target_amount != null && (
                <p className="text-sm text-slate-500">
                  Goal: {formatCurrency(Number(j.target_amount))}
                </p>
              )}
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => fund(j.id)}>
                Add funds
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
