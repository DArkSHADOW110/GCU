"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, ContactType } from "@/types/database";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ContactType>("bank");
  const [account, setAccount] = useState("");

  function load() {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts ?? []));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        contact_type: type,
        account_number: account,
      }),
    });
    setLabel("");
    setAccount("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contacts</h1>
        <p className="text-slate-400">Bank, bill, and mobile top-up numbers</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Add contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-3">
            <div>
              <Label>Label</Label>
              <Input className="mt-1" value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 text-sm text-white"
                value={type}
                onChange={(e) => setType(e.target.value as ContactType)}
              >
                <option value="bank">Bank account</option>
                <option value="bill">Bill payment</option>
                <option value="mobile">Mobile top-up</option>
              </select>
            </div>
            <div>
              <Label>Account / number</Label>
              <Input
                className="mt-1"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Save contact</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-surface-border px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{c.label}</p>
              <p className="text-xs text-slate-500">
                {c.contact_type} · {c.account_number}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
