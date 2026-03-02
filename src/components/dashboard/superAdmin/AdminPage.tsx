"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

const team = [
  { name: "Sabbir Rah", role: "KYC specialist", email: "admin@escrow.com", resolved: 31 },
  { name: "Ankon Mah", role: "KYC specialist", email: "admin@escrow.com", resolved: 31 },
  { name: "Sujon Miya", role: "KYC specialist", email: "admin@escrow.com", resolved: 31 },
];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [members, setMembers] = useState(team);

  const handleRemove = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInvite = () => {
    if (!email || !role) return;
    setMembers((prev) => [
      ...prev,
      { name: email.split("@")[0], role, email, resolved: 0 },
    ]);
    setEmail("");
    setRole("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Admin Settings & Roles</h2>
        <p className="text-white/40 text-sm mt-1">
          Manage administrators and system configuration
        </p>
      </div>

      {/* Add New Admin form */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
          <CardTitle className="text-white text-base font-semibold">
            Add New Administrator
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <label className="text-white/60 text-sm font-medium">Email Address</label>
              <Input
                className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/20"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-white/60 text-sm font-medium">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/50 min-h-12 focus:ring-0 focus:border-white/20">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
                  <SelectItem value="KYC specialist">KYC Specialist</SelectItem>
                  {/* <SelectItem value="Escrow Manager">Escrow Manager</SelectItem>
                  <SelectItem value="Dispute Resolver">Dispute Resolver</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:text-white h-10 px-5"
              onClick={() => { setEmail(""); setRole(""); }}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-10 px-5"
              onClick={handleInvite}
              disabled={!email || !role}
            >
              Send Invitation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team list */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-white/5">
          <CardTitle className="text-white text-base font-semibold">
            Admin & Agent Team
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-3 divide-y divide-white/5">
          {members.map((member, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-4"
            >
              <Avatar className="w-10 h-10 bg-[#2a2d3e] shrink-0">
                <AvatarFallback className="bg-[#2a2d3e] text-white/60 text-xs font-semibold">
                  SA
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{member.name}</p>
              </div>

              <div className="hidden sm:block flex-1 min-w-0">
                <p className="text-white/60 text-sm">{member.role}</p>
                <p className="text-white/35 text-xs">{member.email}</p>
              </div>

              <div className="hidden md:block text-center shrink-0 w-28">
                <p className="text-white/40 text-xs mb-0.5">Issue Resolved</p>
                <p className="text-white text-sm font-medium">{member.resolved}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/60 bg-transparent shrink-0"
                onClick={() => handleRemove(i)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>
          ))}

          {members.length === 0 && (
            <div className="py-10 text-center text-white/30 text-sm">
              No team members yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}