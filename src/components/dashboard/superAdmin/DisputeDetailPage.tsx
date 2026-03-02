import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

export default function DisputeDetailPage({
  params,
}: {
  params?: { id: string };
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-2xl font-bold">Dispute Management</h2>
        <p className="text-white/40 text-sm mt-1">Transactions Tnx001</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Left */}
        <div className="space-y-5">
          {/* Dispute Summary */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Dispute Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-5">
              <div>
                <p className="text-white/40 text-xs mb-1.5">Claim Type</p>
                <p className="text-white text-sm font-medium">Not as Described</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1.5">Escrow Amount</p>
                <p className="text-white text-sm font-medium">$1250</p>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Claim */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Buyer Claim
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <p className="text-white/60 text-sm leading-relaxed">
                The Camera has scratches not shown in photos and the lens is damaged
              </p>
              <div>
                <p className="text-[#0099ff] text-sm font-medium mb-3">
                  Evidence Photos (2)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] bg-[#1a1d27] border border-white/5 rounded-xl flex items-center justify-center"
                    >
                      <ImageIcon className="w-8 h-8 text-white/15" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Case Information */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div>
                <p className="text-white/40 text-xs mb-1">AI Confident</p>
                <p className="text-white text-sm font-medium">High</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">AI Processing Time</p>
                <p className="text-white text-sm font-medium">3.4 seconds</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Evidence Items</p>
                <p className="text-white text-sm font-medium">2 photos</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Result */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                AI Result
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <span className="inline-block border border-[#0099ff]/50 text-[#0099ff] rounded-full px-5 py-2 text-sm font-semibold">
                Favor Buyer
              </span>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-[#13151e] border-white/5">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-white text-base font-semibold">
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <Button className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold h-11 border-0">
                View transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}