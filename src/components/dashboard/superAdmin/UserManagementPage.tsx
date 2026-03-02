"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter } from "lucide-react";

const users = [
  { id: 1, name: "John Smith", email: "smith@gmail.com", kyc: "Pending", transactions: 0 },
  { id: 2, name: "Sarah jon", email: "sarah@gmail.com", kyc: "Pending", transactions: 0 },
  { id: 3, name: "Michel Chen", email: "michel@gmail.com", kyc: "Pending", transactions: 0 },
  { id: 4, name: "Emma Radi", email: "emma@gmail.com", kyc: "Approved", transactions: 47 },
  { id: 5, name: "David Kim", email: "david@gmail.com", kyc: "Pending", transactions: 0 },
  { id: 6, name: "Chailau", email: "chailau@gmail.com", kyc: "Approved", transactions: 47 },
];

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      status === "all" || u.kyc.toLowerCase() === status.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-white text-2xl font-bold">User Management</h2>
        <p className="text-white/40 text-sm mt-1">
          Manage users and review KYC submissions
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/30 pl-10 h-11 focus-visible:ring-0 focus-visible:border-white/20"
            placeholder="Search by name, email or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-[220px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10 pointer-events-none" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/60 pl-10 h-11 focus:ring-0 focus:border-white/20">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle className="text-white text-base font-semibold">
            Users ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5">Users</TableHead>
                <TableHead className="text-white/35 font-medium">Email</TableHead>
                <TableHead className="text-white/35 font-medium">KYC Status</TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5">
                  Transactions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="text-white font-medium px-5 py-4">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-white/70">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={
                        user.kyc === "Approved"
                          ? "text-emerald-400 font-semibold"
                          : "text-amber-400 font-semibold"
                      }
                    >
                      {user.kyc}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/70 text-right pr-5">
                    {user.transactions}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}