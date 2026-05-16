import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { analyzeExpenses } from "@/lib/groq/agent";
import * as transactionsRepo from "@/lib/repositories/transactions";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await transactionsRepo.listTransactions(user.id, 100);
  const debits = transactions.filter((t) => t.type === "debit" || t.type === "bill");

  const totalSpend = debits.reduce((s, t) => s + Number(t.amount), 0);
  const analysis = await analyzeExpenses(
    transactions.map((t) => ({
      remark: t.remark,
      amount: Number(t.amount),
      category: t.category,
      type: t.type,
    }))
  );

  return NextResponse.json({
    totalSpend,
    transactionCount: transactions.length,
    analysis,
  });
}
