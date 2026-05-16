import { BillForm } from "@/components/forms/bill-form";

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bill payments</h1>
        <p className="text-slate-400">Pay utilities and registered billers</p>
      </div>
      <BillForm />
    </div>
  );
}
