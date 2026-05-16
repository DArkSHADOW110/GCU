import { TopupForm } from "@/components/forms/topup-form";

export default function TopupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mobile top-up</h1>
        <p className="text-slate-400">Reload prepaid numbers from your linked account</p>
      </div>
      <TopupForm />
    </div>
  );
}
