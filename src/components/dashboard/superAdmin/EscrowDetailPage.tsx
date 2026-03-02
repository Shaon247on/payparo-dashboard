import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, User } from "lucide-react";

const timeline = [
  { label: "Created", date: "2026-02-04  11:25", done: true },
  { label: "In progress", date: "2026-02-04  11:25", done: true },
  { label: "Shipped", date: "2026-02-04  11:25", done: true },
  { label: "Delivered", date: "2026-02-04  11:25", done: true },
];

export default function EscrowDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-5">
      {/* Item header card */}
      <Card className="bg-[#13151e] border-white/5">
        <CardContent className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-white/40 text-xs mb-1">Item name</p>
            <p className="text-white text-xl font-bold">Macbook pro</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs mb-1">Transaction ID</p>
            <p className="text-white text-xl font-bold">{params.id ?? "Trx001"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Transaction Timeline */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Transaction Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/10" />
                <div className="space-y-6">
                  {timeline.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="relative z-10 mt-0.5">
                        <CheckCircle2 className="w-6 h-6 text-white/40" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{step.label}</p>
                        <p className="text-white/35 text-xs mt-0.5">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Transaction amount</span>
                <span className="text-white text-sm font-medium">$2500</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-white/40 text-sm">Platform Fee 2.5%</span>
                <span className="text-white text-sm font-medium">$25</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-white font-semibold text-sm">Total</span>
                <span className="text-white font-semibold text-sm">$2598</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Parties */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#0099ff]/10 rounded-md">
                  <User className="w-4 h-4 text-[#0099ff]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Buyer</p>
                  <p className="text-white text-sm font-medium">John Smith</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#0099ff]/10 rounded-md">
                  <User className="w-4 h-4 text-[#0099ff]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">Seller</p>
                  <p className="text-white text-sm font-medium">Sarah Jonson</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Period */}
          <Card className="bg-[#13151e] border-white/5">
            <CardContent className="px-5 py-6 flex flex-col items-center text-center">
              <Clock className="w-7 h-7 text-amber-400 mb-2" />
              <p className="text-white/40 text-sm mb-1">Inspection Period</p>
              <p className="text-amber-400 text-3xl font-bold tracking-tight">
                18h 45m
              </p>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <Button className="w-full bg-transparent border border-amber-500/60 text-amber-400 hover:bg-amber-500/10 font-semibold h-11">
                Pause Escrow
              </Button>
              <Button className="w-full bg-transparent border border-red-500/60 text-red-400 hover:bg-red-500/10 font-semibold h-11">
                Refund Buyer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}