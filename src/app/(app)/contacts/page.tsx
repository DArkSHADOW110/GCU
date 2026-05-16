"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, ContactType } from "@/types/database";
import { Contact as ContactIcon, Plus, Building2, Receipt, Smartphone, Trash2 } from "lucide-react";

const typeIcons = {
  bank: Building2,
  bill: Receipt,
  mobile: Smartphone,
};

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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ContactIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-text-primary">Contacts</h1>
          <p className="text-text-tertiary text-sm mt-1">Bank, bill, and mobile top-up numbers</p>
        </div>
      </div>

      {/* Add Contact Form */}
      <Card className="max-w-md">
        <CardHeader className="border-b border-[var(--border)]">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={create} className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input 
                className="mt-2" 
                placeholder="e.g. John Doe"
                value={label} 
                onChange={(e) => setLabel(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="mt-2 flex h-10 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 text-sm text-text-primary transition-all focus:border-primary focus:ring-2 focus:ring-[var(--primary-glow)]"
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
                className="mt-2"
                placeholder="Enter account or mobile number"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Save contact</Button>
          </form>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map((c) => {
          const Icon = typeIcons[c.contact_type] || ContactIcon;
          return (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] backdrop-blur-[24px] px-5 py-4 hover:bg-[var(--card-hover)] hover:border-[var(--border-hover)] transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{c.label}</p>
                  <p className="text-xs text-text-tertiary mt-0.5 font-mono tracking-wider">
                    {c.contact_type} · {c.account_number}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => remove(c.id)}
                className="text-text-tertiary hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        {contacts.length === 0 && (
          <div className="text-center py-12 text-text-tertiary">
            <ContactIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No contacts saved yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
