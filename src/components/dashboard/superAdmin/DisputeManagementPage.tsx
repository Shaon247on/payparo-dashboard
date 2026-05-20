import { Card, CardContent } from "@/components/ui/card";
import { Brain, CheckCircle2, User2 } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Ai Reviewing",
    value: "7",
    icon: Brain,
    iconColor: "text-[#0099ff]",
    iconBg: "bg-[#0099ff]/10",
  },
  {
    label: "Ai Resolved",
    value: "3",
    icon: Brain,
    iconColor: "text-[#0099ff]",
    iconBg: "bg-[#0099ff]/10",
  },
  {
    label: "Needs Human",
    value: "1",
    icon: User2,
    iconColor: "text-white/60",
    iconBg: "bg-white/10",
  },
  {
    label: "Completed",
    value: "1",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
  },
];

const disputes = [
  {
    id: "Dispute001",
    transaction: "Transaction Tnx001",
    claimType: "Not as Described",
    amount: "$1250",
    confidence: "High",
    result: "Need Human Review",
    resultStyle: "border-amber-500/50 text-amber-400",
  },
  {
    id: "Dispute001",
    transaction: "Transaction Tnx001",
    claimType: "Missing product",
    amount: "$1250",
    confidence: "High",
    result: "Favor Buyer",
    resultStyle: "border-[#0099ff]/50 text-[#0099ff]",
  },
  {
    id: "Dispute001",
    transaction: "Transaction Tnx001",
    claimType: "Fake Product",
    amount: "$1250",
    confidence: "High",
    result: "Favor Seller",
    resultStyle: "border-emerald-500/50 text-emerald-400",
  },
  {
    id: "Dispute001",
    transaction: "Transaction Tnx001",
    claimType: "Not as Described",
    amount: "$1250",
    confidence: "High",
    result: "Need Human Review",
    resultStyle: "border-amber-500/50 text-amber-400",
  },
];

export default function DisputeManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Dispute Management</h2>
        <p className="text-white/40 text-sm mt-1">
          AI-powered dispute resolution with human oversight
        </p>
      </div>

      {/* Dispute rows */}
      <div className="space-y-3">
        {disputes.map((d, i) => (
          <Link key={i} href={`/dashboard/disputes/${i + 1}`}>
            <Card className="bg-[#13151e] border-white/5 hover:border-white/20 transition-colors cursor-pointer">
              <CardContent className="px-5 py-4">
                <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-center">
                  <div>
                    <p className="text-white/35 text-xs mb-1">{d.id}</p>
                    <p className="text-white text-sm font-medium">
                      {d.transaction}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/35 text-xs mb-1">Claim Type</p>
                    <p className="text-white text-sm font-medium">
                      {d.claimType}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/35 text-xs mb-1">Escrow Amount</p>
                    <p className="text-white text-sm font-medium">{d.amount}</p>
                  </div>
                  <div>
                    <p className="text-white/35 text-xs mb-1">AI Confident</p>
                    <p className="text-white text-sm font-medium">
                      {d.confidence}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-start md:justify-end">
                    <span
                      className={`inline-block border rounded-full px-4 py-1.5 text-xs font-semibold ${d.resultStyle}`}
                    >
                      {d.result}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
