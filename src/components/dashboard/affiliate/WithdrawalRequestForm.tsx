"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Upload, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  withdrawableBalance: string;
}

export default function WithdrawalRequestForm({ withdrawableBalance }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [clabe, setClabe] = useState("");
  const [holderName, setHolderName] = useState("");
  const [invoiceNum, setInvoiceNum] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(amount) < 500) {
      setError("Minimum payout request is 500 MXN.");
      return;
    }
    if (clabe.length !== 18) {
      setError("CLABE must be exactly 18 digits.");
      return;
    }
    if (!file) {
      setError("CFDI Invoice file is required for processing.");
      return;
    }

    startTransition(async () => {
      // Use FormData to upload file
      const fd = new FormData();
      fd.append("amount", amount);
      fd.append("bank_name", bankName);
      fd.append("clabe", clabe);
      fd.append("account_holder_name", holderName);
      fd.append("cfdi_invoice_number", invoiceNum);
      fd.append("cfdi_invoice", file);

      try {
        const res = await fetch("/api/proxy/affiliate/withdrawals/", {
          method: "POST",
          body: fd,
        });

        const body = await res.json();
        if (res.ok) {
          setSuccess("Withdrawal request submitted successfully!");
          router.refresh();
          setTimeout(() => {
            setOpen(false);
            setSuccess("");
            setAmount("");
            setFile(null);
          }, 2000);
        } else {
          setError(body.error ?? "Failed to submit request.");
        }
      } catch {
        setError("Network error — could not reach the server.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs py-5 px-6 rounded-lg shadow-lg hover:shadow-[#00d4aa]/10 transition-all">
          <DollarSign className="w-4 h-4 mr-2" /> Request SPEI Payout
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#13151e] border-white/5 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-base font-bold">Request SPEI Bank Payout</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-[10px] mb-1 block uppercase tracking-wider">Amount (MXN)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min 500"
                required
                className="bg-white/5 border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-white/50 text-[10px] mb-1 block uppercase tracking-wider">Bank Name</label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. BBVA"
                required
                className="bg-white/5 border-white/10 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 text-[10px] mb-1 block uppercase tracking-wider">18-Digit CLABE</label>
            <Input
              value={clabe}
              onChange={(e) => setClabe(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={18}
              placeholder="012345678901234567"
              required
              className="bg-white/5 border-white/10 text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-white/50 text-[10px] mb-1 block uppercase tracking-wider">Account Holder Name</label>
            <Input
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="As registered in your bank"
              required
              className="bg-white/5 border-white/10 text-white text-xs"
            />
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
            <h4 className="text-white/60 font-semibold text-xs uppercase tracking-wider">Tax & CFDI Invoice</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-[10px] mb-1 block uppercase tracking-wider">CFDI Invoice No.</label>
                <Input
                  value={invoiceNum}
                  onChange={(e) => setInvoiceNum(e.target.value)}
                  placeholder="e.g. A-49382"
                  required
                  className="bg-white/5 border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-white/50 text-[10px] mb-1 block uppercase tracking-wider">CFDI Upload</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf,.xml"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="outline" className="w-full border-white/10 bg-white/5 text-xs text-white/70 hover:text-white flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {file ? `${file.name.slice(0, 10)}...` : "Select File"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold text-xs py-5 mt-2">
            {isPending ? "Submitting Payout Request..." : "Confirm & Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
