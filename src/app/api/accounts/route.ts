import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/response";
import * as accountsRepo from "@/lib/repositories/accounts";
import * as transactionsRepo from "@/lib/repositories/transactions";

export async function GET() {
  return withAuth(async (user) => {
    const externalId = user.google_id ?? user.id;
    const accounts = await accountsRepo.ensureDemoAccounts(user.id, externalId);
    if (accounts[0]) {
      await transactionsRepo.seedDemoTransactions(user.id, accounts[0].id);
    }
    return { accounts };
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return withAuth(async (user) => {
    if (body.account_name && body.account_number) {
      const account = await accountsRepo.linkManualAccount(user.id, {
        account_name: String(body.account_name),
        account_number: String(body.account_number),
        account_type: body.account_type ? String(body.account_type) : undefined,
        provider: body.provider ? String(body.provider) : undefined,
        currency: body.currency ? String(body.currency) : undefined,
        balance: body.balance != null ? Number(body.balance) : undefined,
        is_primary: Boolean(body.is_primary),
      });
      return { account, linked: true };
    }

    const externalId = user.google_id ?? user.id;
    const accounts = await accountsRepo.syncAccountsFromBank(user.id, externalId);
    return { accounts, synced: true };
  });
}
