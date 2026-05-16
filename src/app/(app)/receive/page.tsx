"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { LinkedAccount } from "@/types/database";

export default function ReceivePage() {
  const [primary, setPrimary] = useState<LinkedAccount | null>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        const list: LinkedAccount[] = d.accounts ?? [];
        setPrimary(list.find((a) => a.is_primary) ?? list[0] ?? null);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Receive</h1>
        <p className="text-slate-400">Share your account details to receive payments</p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Your receiving account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-300">
          {primary ? (
            <>
              <p>
                <span className="text-slate-500">Name:</span> {primary.account_name}
              </p>
              <p>
                <span className="text-slate-500">Account:</span> {primary.account_number}
              </p>
              <p>
                <span className="text-slate-500">Bank:</span> {primary.provider}
              </p>
            </>
          ) : (
            <p>Link an account from the Accounts page first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
