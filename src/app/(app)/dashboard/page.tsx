"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { LinkedAccount, Transaction, Contact } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Receipt, Activity, Wallet, CreditCard, Download, X, QrCode, BarChart3, PieChart as PieChartIcon, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpTab, setTopUpTab] = useState<"topup" | "bills" | "scheduled">("topup");
  const [receiveAccountId, setReceiveAccountId] = useState("");
  const [expenseAnalysis, setExpenseAnalysis] = useState<{ totalSpend: number; transactionCount: number; analysis: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expenseTimeframe, setExpenseTimeframe] = useState<"1d"|"3d"|"7d"|"1m"|"3m"|"6m">("1m");
  const [chartType, setChartType] = useState<"category" | "timeline">("category");
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [sendForm, setSendForm] = useState({
    fromAccountId: "",
    bankName: "",
    accountNumber: "",
    ownerName: "",
    remarks: "",
    category: "extra",
    saveContact: false,
  });
  const [billForm, setBillForm] = useState({
    fromAccountId: "",
    billerName: "",
    referenceNumber: "",
    amount: "",
    remarks: "",
    saveContact: false,
    isScheduled: false,
    scheduledDate: "",
    scheduledTime: "",
  });
  const [topUpForm, setTopUpForm] = useState({
    fromAccountId: "",
    provider: "",
    mobileNumber: "",
    amount: "",
    isScheduled: false,
    scheduledDate: "",
    scheduledTime: "",
  });
  const [scheduledTransactions, setScheduledTransactions] = useState<{id: string, title: string, amount: string, date: string, type: string}[]>([
    { id: "1", title: "Dialog Mobile Top-Up", amount: "1000", date: "2026-06-01 10:00", type: "topup" },
    { id: "2", title: "CEB Electricity Bill", amount: "8500", date: "2026-06-05 14:30", type: "bill" }
  ]);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []));
    fetch("/api/transactions?limit=5")
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []));
    fetch("/api/transactions?limit=1000")
      .then((r) => r.json())
      .then((d) => setAllTransactions(d.transactions ?? []));
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts ?? []));
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);

  const timeframes = { "1d": 1, "3d": 3, "7d": 7, "1m": 30, "3m": 90, "6m": 180 };
  const cutoff = new Date(Date.now() - timeframes[expenseTimeframe] * 24 * 60 * 60 * 1000).getTime();
  const filteredTxs = allTransactions.filter(t => (t.type === "debit" || t.type === "bill") && new Date(t.occurred_at || t.created_at).getTime() >= cutoff);

  const categoryTotals: Record<string, number> = {};
  filteredTxs.forEach(t => {
    const cat = (t.category || "extra").toLowerCase();
    const mappedCat = ["food", "transport", "savings", "entertainment", "telecommunication", "health"].includes(cat) ? cat : "extra";
    categoryTotals[mappedCat] = (categoryTotals[mappedCat] || 0) + Number(t.amount);
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a,b) => b.value - a.value);
  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  const timelineDataRaw: { date: Date, amount: number }[] = [];
  filteredTxs.forEach(t => {
    const date = new Date(t.occurred_at || t.created_at);
    date.setHours(0,0,0,0);
    const existing = timelineDataRaw.find(d => d.date.getTime() === date.getTime());
    if (existing) existing.amount += Number(t.amount);
    else timelineDataRaw.push({ date, amount: Number(t.amount) });
  });
  const timelineData = timelineDataRaw
    .sort((a,b) => a.date.getTime() - b.date.getTime())
    .map(d => ({
      name: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: d.amount
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white/90 drop-shadow-md">Overview</h1>
        <p className="text-slate-400 text-sm font-medium">Your unified financial command center</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 group">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2 pb-8">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 px-4 md:px-6">
            <CardTitle className="text-lg font-medium text-white/90 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 px-4 md:px-6 py-6 flex-1">
            <Button 
              onClick={() => {
                if (accounts.length > 0) setSendForm(prev => ({ ...prev, fromAccountId: accounts[0].id }));
                setIsSendModalOpen(true);
              }}
              className="w-full h-full min-h-[100px] flex flex-col justify-center items-center gap-3 bg-gradient-to-br from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 border-none rounded-2xl active:scale-95">
              <Send className="h-7 w-7" /> <span className="text-sm">Send</span>
            </Button>
            <Button 
              onClick={() => {
                if (accounts.length > 0) setReceiveAccountId(accounts[0].id);
                setIsReceiveModalOpen(true);
              }}
              variant="outline" 
              className="w-full h-full min-h-[100px] flex flex-col justify-center items-center gap-3 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 transition-all duration-300 rounded-2xl active:scale-95 bg-white/5"
            >
              <Download className="h-7 w-7 text-cyan-400" /> <span className="text-sm">Receive</span>
            </Button>
            <Button 
              onClick={() => {
                if (accounts.length > 0) {
                  setBillForm(prev => ({ ...prev, fromAccountId: accounts[0].id }));
                  setTopUpForm(prev => ({ ...prev, fromAccountId: accounts[0].id }));
                }
                setTopUpTab("topup");
                setIsTopUpModalOpen(true);
              }}
              variant="outline" 
              className="w-full h-full min-h-[100px] flex flex-col justify-center items-center gap-3 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 transition-all duration-300 rounded-2xl active:scale-95 bg-white/5"
            >
              <Receipt className="h-7 w-7 text-cyan-400" /> <span className="text-sm">Top-Up</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 h-full flex flex-col">
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

      <div className="pb-8">
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 px-4 md:px-6">
            <CardTitle className="text-lg font-medium text-white/90 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              AI Expense Analysis
            </CardTitle>
            {!expenseAnalysis && (
              <Button 
                onClick={async () => {
                  setIsAnalyzing(true);
                  try {
                    const res = await fetch("/api/expense-analysis");
                    const data = await res.json();
                    if (data.analysis) {
                      setExpenseAnalysis(data);
                    } else {
                      console.error(data);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
                disabled={isAnalyzing}
                size="sm" 
                className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all active:scale-95"
              >
                {isAnalyzing ? "Analyzing..." : "Generate Insights"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6 px-4 md:px-6">
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-white font-medium text-sm flex items-center gap-2">
                    {chartType === "category" ? <BarChart3 className="w-4 h-4 text-cyan-400"/> : <Activity className="w-4 h-4 text-cyan-400"/>} 
                    {chartType === "category" ? "Spending by Category" : "Expenses Timeline"}
                  </h3>
                  <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button onClick={() => setChartType("category")} className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${chartType === "category" ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>Category</button>
                    <button onClick={() => setChartType("timeline")} className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${chartType === "timeline" ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>Timeline</button>
                  </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                  {(["1d", "3d", "7d", "1m", "3m", "6m"] as const).map(tf => (
                    <button 
                      key={tf} 
                      onClick={() => setExpenseTimeframe(tf)}
                      className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${expenseTimeframe === tf ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              
              {(chartType === "category" ? chartData.length : timelineData.length) > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "category" ? (
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value: number) => [formatCurrency(value), "Amount"]}
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          formatter={(value: number) => [formatCurrency(value), "Amount"]}
                        />
                        <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', stroke: '#06b6d4', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] w-full flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
                  <p className="text-slate-500 text-sm font-medium">No expenses found for this timeframe.</p>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-white/10 mb-8" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400"/> AI Insights</h3>
            </div>
            {!expenseAnalysis ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  {isAnalyzing ? (
                    <div className="h-5 w-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                  ) : (
                    <Activity className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <p className="text-slate-300 text-sm">{isAnalyzing ? "AI is analyzing your transactions..." : "No analysis generated yet."}</p>
                <p className="text-slate-500 text-xs mt-1">Click the button above to analyze your recent spending patterns using AI.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Total Analyzed Spend</p>
                    <p className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{formatCurrency(expenseAnalysis.totalSpend)}</p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center shadow-inner">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Transactions Analyzed</p>
                    <p className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{expenseAnalysis.transactionCount}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-5 shadow-inner">
                  <div className="prose prose-invert prose-p:text-sm prose-p:text-slate-300 prose-p:leading-relaxed max-w-none">
                    {expenseAnalysis.analysis.split('\n').map((line, i) => {
                      if (!line.trim()) return <br key={i} />;
                      if (line.startsWith('#')) return <strong key={i} className="block text-cyan-400 text-base mt-4 mb-2">{line.replace(/#/g, '').trim()}</strong>;
                      if (line.startsWith('-')) return <li key={i} className="text-sm text-slate-300 ml-4 list-disc">{line.substring(1).trim().replace(/\*\*/g, '')}</li>;
                      return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Background effects */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Send className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Send Money</h2>
              </div>
              <button 
                onClick={() => setIsSendModalOpen(false)} 
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative z-10 p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Pay From Account</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-black/40 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer"
                    value={sendForm.fromAccountId}
                    onChange={(e) => setSendForm({ ...sendForm, fromAccountId: e.target.value })}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">-- Select sending account --</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                        {a.provider || 'Bank'} - {a.account_name} ({formatCurrency(Number(a.balance), a.currency)})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saved Contacts</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner cursor-pointer"
                    onChange={(e) => {
                      const c = contacts.find(c => c.id === e.target.value);
                      if (c) {
                        setSendForm({ ...sendForm, accountNumber: c.account_number, bankName: c.bank_code || c.provider || '', ownerName: c.label || '' });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">-- Select a contact (Optional) --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.label} ({c.account_number})</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bank Name</label>
                  <input 
                    type="text" 
                    value={sendForm.bankName}
                    onChange={e => setSendForm({ ...sendForm, bankName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                    placeholder="e.g. Seylan Bank"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Number</label>
                  <input 
                    type="text" 
                    value={sendForm.accountNumber}
                    onChange={e => setSendForm({ ...sendForm, accountNumber: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                    placeholder="Account No."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Owner Name</label>
                <input 
                  type="text" 
                  value={sendForm.ownerName}
                  onChange={e => setSendForm({ ...sendForm, ownerName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                  placeholder="Account holder name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remarks (Optional)</label>
                  <input 
                    type="text" 
                    value={sendForm.remarks}
                    onChange={e => setSendForm({ ...sendForm, remarks: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                    placeholder="What is this for?"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner cursor-pointer"
                      value={sendForm.category}
                      onChange={(e) => setSendForm({ ...sendForm, category: e.target.value })}
                    >
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="savings">Savings</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="telecommunication">Telecommunication</option>
                      <option value="health">Health</option>
                      <option value="extra">Extra</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 py-3 bg-white/5 rounded-xl px-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setSendForm(s => ({...s, saveContact: !s.saveContact}))}>
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    id="saveContact"
                    checked={sendForm.saveContact}
                    onChange={e => setSendForm({ ...sendForm, saveContact: e.target.checked })}
                    onClick={e => e.stopPropagation()}
                    className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-black/40 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <label className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                  Save this account to my contacts
                </label>
              </div>

              <Button 
                onClick={async () => {
                  if (sendForm.saveContact) {
                    await fetch("/api/contacts", {
                      method: "POST",
                      body: JSON.stringify({
                        label: sendForm.ownerName || "Saved Contact",
                        contact_type: "bank",
                        account_number: sendForm.accountNumber,
                        bank_code: sendForm.bankName,
                      })
                    });
                    fetch("/api/contacts")
                      .then((r) => r.json())
                      .then((d) => setContacts(d.contacts ?? []));
                  }
                  setIsSendModalOpen(false);
                  setSendForm({ fromAccountId: "", bankName: "", accountNumber: "", ownerName: "", remarks: "", saveContact: false });
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold py-6 text-base rounded-xl mt-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-[0.98]"
              >
                Execute Payment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Download className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Receive Money</h2>
              </div>
              <button 
                onClick={() => { setIsReceiveModalOpen(false); setReceiveAccountId(""); }} 
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative z-10 p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Select Account</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-black/40 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer"
                    value={receiveAccountId}
                    onChange={(e) => setReceiveAccountId(e.target.value)}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">-- Select receiving account --</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                        {a.provider || 'Bank'} - {a.account_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {receiveAccountId && (
                <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG 
                      value={accounts.find(a => a.id === receiveAccountId)?.account_number || ""} 
                      size={180} 
                      level="H" 
                      includeMargin={false} 
                    />
                  </div>
                  
                  <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Bank</span>
                      <span className="text-sm text-white font-medium">{accounts.find(a => a.id === receiveAccountId)?.provider || 'Seylan Bank'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Branch</span>
                      <span className="text-sm text-white font-medium">Head Office</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Name</span>
                      <span className="text-sm text-white font-medium">{accounts.find(a => a.id === receiveAccountId)?.account_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-cyan-400 uppercase tracking-wider font-semibold">A/C Number</span>
                      <span className="text-sm text-cyan-400 font-bold tracking-widest">{accounts.find(a => a.id === receiveAccountId)?.account_number}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-1"
                    onClick={() => {
                      const accNo = accounts.find(a => a.id === receiveAccountId)?.account_number;
                      if (accNo) navigator.clipboard.writeText(accNo);
                    }}
                  >
                    Copy Account Number
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 p-5 border-b border-white/5 flex flex-col gap-4 bg-white/5 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Top-Up & Bills</h2>
                </div>
                <button 
                  onClick={() => setIsTopUpModalOpen(false)} 
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button onClick={() => setTopUpTab("topup")} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${topUpTab === "topup" ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>TOP-UP</button>
                <button onClick={() => setTopUpTab("bills")} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${topUpTab === "bills" ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>BILLS</button>
                <button onClick={() => setTopUpTab("scheduled")} className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${topUpTab === "scheduled" ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>SCHEDULED</button>
              </div>
            </div>
            
            <div className="relative z-10 p-6 flex flex-col gap-5 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              
              {topUpTab === "scheduled" ? (
                <div className="flex flex-col gap-3">
                  {scheduledTransactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No scheduled payments.</div>
                  ) : (
                    scheduledTransactions.map(st => (
                      <div key={st.id} className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium text-sm">{st.title}</p>
                            <p className="text-cyan-400 font-bold text-sm mt-0.5">Rs. {st.amount}</p>
                          </div>
                          <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
                            <button className="px-2 py-1.5 text-xs text-slate-300 hover:text-cyan-400 hover:bg-white/10 rounded-md transition-colors">Edit</button>
                            <button onClick={() => setScheduledTransactions(s => s.filter(x => x.id !== st.id))} className="px-2 py-1.5 text-xs text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors">Remove</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" /> Executes on: {st.date}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Pay From Account</label>
                    <div className="relative">
                      <select 
                        className="w-full appearance-none bg-black/40 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer"
                        value={topUpTab === "topup" ? topUpForm.fromAccountId : billForm.fromAccountId}
                        onChange={(e) => topUpTab === "topup" ? setTopUpForm({ ...topUpForm, fromAccountId: e.target.value }) : setBillForm({ ...billForm, fromAccountId: e.target.value })}
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-400">-- Select sending account --</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                            {a.provider || 'Bank'} - {a.account_name} ({formatCurrency(Number(a.balance), a.currency)})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  {topUpTab === "topup" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Provider</label>
                          <div className="relative">
                            <select 
                              className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner cursor-pointer"
                              value={topUpForm.provider}
                              onChange={e => setTopUpForm({ ...topUpForm, provider: e.target.value })}
                            >
                              <option value="" disabled className="bg-slate-900 text-slate-400">-- Select --</option>
                              <option value="Dialog" className="bg-slate-900 text-white">Dialog</option>
                              <option value="Mobitel" className="bg-slate-900 text-white">Mobitel</option>
                              <option value="Hutch" className="bg-slate-900 text-white">Hutch</option>
                              <option value="Airtel" className="bg-slate-900 text-white">Airtel</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mobile Number</label>
                          <input 
                            type="text" 
                            value={topUpForm.mobileNumber}
                            onChange={e => setTopUpForm({ ...topUpForm, mobileNumber: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                            placeholder="07X XXX XXXX"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saved Billers</label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner cursor-pointer"
                            onChange={(e) => {
                              const c = contacts.find(c => c.id === e.target.value);
                              if (c) {
                                setBillForm({ ...billForm, referenceNumber: c.account_number, billerName: c.label || '' });
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled className="bg-slate-900 text-slate-400">-- Select a saved biller --</option>
                            {contacts.filter(c => c.contact_type === "bill").map(c => (
                              <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.label} ({c.account_number})</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Biller Name</label>
                          <input 
                            type="text" 
                            value={billForm.billerName}
                            onChange={e => setBillForm({ ...billForm, billerName: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                            placeholder="e.g. CEB, Water Board"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account No.</label>
                          <input 
                            type="text" 
                            value={billForm.referenceNumber}
                            onChange={e => setBillForm({ ...billForm, referenceNumber: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20"
                            placeholder="Account Number"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Amount (LKR)</label>
                    <input 
                      type="number" 
                      value={topUpTab === "topup" ? topUpForm.amount : billForm.amount}
                      onChange={e => topUpTab === "topup" ? setTopUpForm({ ...topUpForm, amount: e.target.value }) : setBillForm({ ...billForm, amount: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder:text-white/20 font-bold text-cyan-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="h-px w-full bg-white/10 my-1" />

                  {/* Schedule Checkbox */}
                  <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => topUpTab === "topup" ? setTopUpForm(s => ({...s, isScheduled: !s.isScheduled})) : setBillForm(s => ({...s, isScheduled: !s.isScheduled}))}>
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={topUpTab === "topup" ? topUpForm.isScheduled : billForm.isScheduled}
                        onChange={e => topUpTab === "topup" ? setTopUpForm({ ...topUpForm, isScheduled: e.target.checked }) : setBillForm({ ...billForm, isScheduled: e.target.checked })}
                        onClick={e => e.stopPropagation()}
                        className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-black/40 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-slate-300 cursor-pointer select-none flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" /> Schedule Payment
                    </label>
                  </div>

                  {(topUpTab === "topup" ? topUpForm.isScheduled : billForm.isScheduled) && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Date</label>
                        <input 
                          type="date" 
                          value={topUpTab === "topup" ? topUpForm.scheduledDate : billForm.scheduledDate}
                          onChange={e => topUpTab === "topup" ? setTopUpForm({ ...topUpForm, scheduledDate: e.target.value }) : setBillForm({ ...billForm, scheduledDate: e.target.value })}
                          className="w-full bg-black/40 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner [color-scheme:dark]"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Time</label>
                        <input 
                          type="time" 
                          value={topUpTab === "topup" ? topUpForm.scheduledTime : billForm.scheduledTime}
                          onChange={e => topUpTab === "topup" ? setTopUpForm({ ...topUpForm, scheduledTime: e.target.value }) : setBillForm({ ...billForm, scheduledTime: e.target.value })}
                          className="w-full bg-black/40 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  )}

                  {topUpTab === "bills" && (
                    <div className="flex items-center gap-3 mt-2 py-3 bg-white/5 rounded-xl px-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setBillForm(s => ({...s, saveContact: !s.saveContact}))}>
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={billForm.saveContact}
                          onChange={e => setBillForm({ ...billForm, saveContact: e.target.checked })}
                          onClick={e => e.stopPropagation()}
                          className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-black/40 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer"
                        />
                        <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <label className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                        Save this biller
                      </label>
                    </div>
                  )}

                  <Button 
                    onClick={async () => {
                      const isSched = topUpTab === "topup" ? topUpForm.isScheduled : billForm.isScheduled;
                      const title = topUpTab === "topup" ? `${topUpForm.provider} Top-Up` : billForm.billerName;
                      const amt = topUpTab === "topup" ? topUpForm.amount : billForm.amount;
                      const date = topUpTab === "topup" ? `${topUpForm.scheduledDate} ${topUpForm.scheduledTime}` : `${billForm.scheduledDate} ${billForm.scheduledTime}`;
                      
                      if (isSched) {
                        setScheduledTransactions(s => [...s, { id: Date.now().toString(), title, amount: amt, date, type: topUpTab }]);
                      } else {
                        if (topUpTab === "bills" && billForm.saveContact) {
                          await fetch("/api/contacts", {
                            method: "POST",
                            body: JSON.stringify({
                              label: billForm.billerName || "Saved Biller",
                              contact_type: "bill",
                              account_number: billForm.referenceNumber,
                            })
                          });
                          fetch("/api/contacts")
                            .then((r) => r.json())
                            .then((d) => setContacts(d.contacts ?? []));
                        }
                      }
                      
                      setIsTopUpModalOpen(false);
                      setTopUpTab("topup");
                      setBillForm({ fromAccountId: "", billerName: "", referenceNumber: "", amount: "", remarks: "", saveContact: false, isScheduled: false, scheduledDate: "", scheduledTime: "" });
                      setTopUpForm({ fromAccountId: "", provider: "", mobileNumber: "", amount: "", isScheduled: false, scheduledDate: "", scheduledTime: "" });
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold py-6 text-base rounded-xl mt-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-[0.98] shrink-0"
                  >
                    {(topUpTab === "topup" ? topUpForm.isScheduled : billForm.isScheduled) ? "Schedule Payment" : "Execute Payment"} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
