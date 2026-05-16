import { getBankingAdapter } from "@/lib/banking";
import { analyzeExpenses } from "@/lib/groq/expense-analysis";
import * as accountsRepo from "@/lib/repositories/accounts";
import * as contactsRepo from "@/lib/repositories/contacts";
import * as jarsRepo from "@/lib/repositories/jars";
import * as schedulesRepo from "@/lib/repositories/scheduled-payments";
import * as transactionsRepo from "@/lib/repositories/transactions";
import type { ContactType, User } from "@/types/database";

export async function executeAgentTool(
  user: User,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "list_accounts": {
      const accounts = await accountsRepo.listAccounts(user.id);
      return accounts.map((a) => ({
        id: a.id,
        name: a.account_name,
        number: a.account_number,
        balance: a.balance,
        currency: a.currency,
        provider: a.provider,
      }));
    }
    case "transfer_money": {
      const fromId = String(args.from_account_id);
      const amount = Number(args.amount);
      const account = await accountsRepo.getAccount(user.id, fromId);
      if (!account) return { error: "Account not found" };
      const adapter = getBankingAdapter();
      const result = await adapter.transfer({
        fromAccountId: account.external_account_id ?? account.id,
        toAccountNumber: String(args.to_account_number),
        amount,
        currency: account.currency,
        remark: args.remark ? String(args.remark) : undefined,
      });
      await transactionsRepo.createTransaction(user.id, {
        linked_account_id: account.id,
        type: "transfer",
        amount,
        currency: account.currency,
        counterparty: String(args.to_account_number),
        remark: args.remark ? String(args.remark) : "AI transfer",
        status: "completed",
      });
      return result;
    }
    case "pay_bill": {
      const fromId = String(args.from_account_id);
      const amount = Number(args.amount);
      const account = await accountsRepo.getAccount(user.id, fromId);
      if (!account) return { error: "Account not found" };
      const adapter = getBankingAdapter();
      const result = await adapter.payBill({
        fromAccountId: account.external_account_id ?? account.id,
        billerAccount: String(args.biller_account),
        amount,
        currency: account.currency,
        reference: args.reference ? String(args.reference) : undefined,
      });
      await transactionsRepo.createTransaction(user.id, {
        linked_account_id: account.id,
        type: "bill",
        amount,
        currency: account.currency,
        counterparty: String(args.biller_account),
        remark: "Bill payment via assistant",
        status: "completed",
      });
      return result;
    }
    case "mobile_topup": {
      const fromId = String(args.from_account_id);
      const amount = Number(args.amount);
      const account = await accountsRepo.getAccount(user.id, fromId);
      if (!account) return { error: "Account not found" };
      const adapter = getBankingAdapter();
      const mobileNumber = String(args.mobile_number);
      const result = await adapter.mobileTopup({
        fromAccountId: account.external_account_id ?? account.id,
        mobileNumber,
        amount,
        currency: account.currency,
        provider: args.provider ? String(args.provider) : undefined,
      });
      await transactionsRepo.createTransaction(user.id, {
        linked_account_id: account.id,
        type: "topup",
        amount,
        currency: account.currency,
        counterparty: mobileNumber,
        remark: "Mobile top-up via assistant",
        status: "completed",
      });
      return result;
    }
    case "list_jars":
      return jarsRepo.listJars(user.id);
    case "create_jar":
      return jarsRepo.createJar(user.id, {
        name: String(args.name),
        target_amount: args.target_amount ? Number(args.target_amount) : null,
      });
    case "fund_jar": {
      const jar = await jarsRepo.fundJar(
        user.id,
        String(args.jar_id),
        Number(args.amount)
      );
      return jar ?? { error: "Jar not found" };
    }
    case "list_contacts":
      return contactsRepo.listContacts(user.id);
    case "create_contact":
      return contactsRepo.createContact(user.id, {
        label: String(args.label),
        contact_type: String(args.contact_type) as ContactType,
        account_number: String(args.account_number),
      });
    case "list_scheduled_payments":
      return schedulesRepo.listScheduledPayments(user.id);
    case "create_scheduled_payment":
      return schedulesRepo.createScheduledPayment(user.id, {
        label: String(args.label),
        amount: Number(args.amount),
        day_of_month: Number(args.day_of_month),
        contact_id: args.contact_id ? String(args.contact_id) : null,
        linked_account_id: args.linked_account_id
          ? String(args.linked_account_id)
          : null,
      });
    case "get_recent_transactions":
      return transactionsRepo.listTransactions(
        user.id,
        args.limit ? Number(args.limit) : 20
      );
    case "analyze_expenses": {
      const txs = await transactionsRepo.listTransactions(user.id, 100);
      const debits = txs.filter((t) => t.type !== "credit");
      const analysis = await analyzeExpenses(
        debits.map((t) => ({
          remark: t.remark,
          amount: Number(t.amount),
          category: t.category,
          type: t.type,
        }))
      );
      return { analysis };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
