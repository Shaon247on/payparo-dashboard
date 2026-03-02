"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, MessageCircle, User } from "lucide-react";
import { FinalizeDisputeModal } from "@/components/elements/FinalizeDisputeModal";
import { ChatModal } from "@/components/elements/ChatModel";

export default function MyDisputeDetailPage({ params }: { params: { id: string } }) {
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState({ name: "", avatar: "" });

  const openChat = (name: string) => {
    setChatUser({ name, avatar: "" });
    setChatOpen(true);
  };

  return (
    <>
      <div className="space-y-5 pb-24">
        <div>
          <h2 className="text-white text-2xl font-bold">Dispute Management</h2>
          <p className="text-white/40 text-sm mt-1">Transactions Tnx001</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Left */}
          <div className="space-y-5">
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">Dispute Summary</CardTitle>
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

            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">Buyer Claim</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <p className="text-white/60 text-sm leading-relaxed">
                  The Camera has scratches not shown in photos and the lens is damaged
                </p>
                <div>
                  <p className="text-[#0099ff] text-sm font-medium mb-3">Evidence Photos (2)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="aspect-[4/3] bg-[#1a1d27] border border-white/5 rounded-xl flex items-center justify-center">
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
            {/* Users */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">Users</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#0099ff]/10 rounded-md">
                      <User className="w-4 h-4 text-[#0099ff]" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Seller</p>
                      <p className="text-white text-sm font-medium">Ankon Marma</p>
                    </div>
                  </div>
                  <Button size="icon" onClick={() => openChat("Ankon Marma")}
                    className="w-8 h-8 rounded-full bg-[#0099ff] hover:bg-[#007acc]">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </Button>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-[#0099ff]/10 rounded-md">
                      <User className="w-4 h-4 text-[#0099ff]" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Buyer</p>
                      <p className="text-white text-sm font-medium">Chailau Marma</p>
                    </div>
                  </div>
                  <Button size="icon" onClick={() => openChat("Chailau Marma")}
                    className="w-8 h-8 rounded-full bg-[#0099ff] hover:bg-[#007acc]">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Case Information */}
            <Card className="bg-[#13151e] border-white/5">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-white text-base font-semibold">Case Information</CardTitle>
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
                <CardTitle className="text-white text-base font-semibold">AI Result</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <span className="inline-block border border-[#0099ff]/50 text-[#0099ff] rounded-full px-5 py-2 text-sm font-semibold">
                  Favor Buyer
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 right-0 left-0 md:left-[220px] lg:left-[240px] bg-[#0f1117]/80 backdrop-blur-sm border-t border-white/5 px-4 md:px-6 lg:px-8 py-4 flex justify-end z-10">
        <Button
          onClick={() => setFinalizeOpen(true)}
          className="bg-[#0099ff] hover:bg-[#007acc] text-white font-semibold h-11 px-8"
        >
          Resolve Case
        </Button>
      </div>

      <FinalizeDisputeModal
        open={finalizeOpen}
        onClose={() => setFinalizeOpen(false)}
        caseId="4589514"
        onResolve={(favor) => console.log("Resolved:", favor)}
      />
      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userName={chatUser.name}
        userAvatar={chatUser.avatar}
      />
    </>
  );
}