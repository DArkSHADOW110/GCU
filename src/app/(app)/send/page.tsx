import { TransferForm } from "@/components/forms/transfer-form";

export default function SendPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Send money</h1>
        <p className="text-slate-400">Transfer to any bank account</p>
      </div>
      <TransferForm />
    </div>
  );
}
