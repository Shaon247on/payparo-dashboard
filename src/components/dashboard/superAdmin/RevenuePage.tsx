"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Dot,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BarChart2, Filter, MoreVertical, CheckCircle2, XCircle } from "lucide-react";

const stats = [
  { label: "Today Revenue", value: "$6,450" },
  { label: "This Week", value: "$34,520" },
  { label: "This Month", value: "$158,780" },
  { label: "Total Revenue", value: "$2.4M" },
];

const revenueData = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 48000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 40000 },
  { month: "May", revenue: 17000 },
  { month: "Jun", revenue: 51000 },
  { month: "Jul", revenue: 44000 },
  { month: "Aug", revenue: 90000 },
];

const dailyData = [
  { month: "Jan", txns: 1500 },
  { month: "Feb", txns: 650 },
  { month: "Mar", txns: 1050 },
  { month: "Apr", txns: 200 },
  { month: "May", txns: 1900 },
];

const revenueChartConfig = {
  revenue: { label: "Revenue ($)", color: "#0099ff" },
} satisfies ChartConfig;

const dailyChartConfig = {
  txns: { label: "Transactions", color: "#00aaff" },
} satisfies ChartConfig;

type TxStatus = "Completed" | "Pending";

const transactions: {
  id: string;
  type: string;
  amount: string;
  status: TxStatus;
  date: string;
}[] = [
  { id: "Tx001", type: "Withdraw", amount: "$2500", status: "Completed", date: "2026-02-07 10:30" },
  { id: "Tx002", type: "Withdraw", amount: "$1520", status: "Completed", date: "2026-02-07 10:30" },
  { id: "Tx003", type: "Withdraw", amount: "$2630", status: "Pending", date: "2026-02-07 10:30" },
  { id: "Tx004", type: "Withdraw", amount: "$2150", status: "Completed", date: "2026-02-07 10:30" },
  { id: "Tx005", type: "Withdraw", amount: "$1256", status: "Pending", date: "2026-02-07 10:30" },
  { id: "Tx006", type: "Withdraw", amount: "$7852", status: "Pending", date: "2026-02-07 10:30" },
];

export default function RevenuePage() {
  const [filter, setFilter] = useState("withdraw");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Revenue</h2>
        <p className="text-white/40 text-sm mt-1">
          Platform earnings and transaction analytics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-md bg-emerald-400/10">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-white/50 text-sm font-medium">{label}</span>
              </div>
              <p className="text-white font-bold text-2xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Line chart */}
        <Card className="bg-[#13151e] border-white/5 flex-1">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-white text-base font-semibold">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
              <LineChart data={revenueData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={true} horizontal={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => v === 0 ? "$0" : `${v / 1000}k`} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-white text-gray-900 border-0 shadow-xl rounded-xl px-3 py-2"
                      formatter={(value) => [
                        <span key="v" className="text-[#0099ff] font-semibold">Revenue ($) : {value}</span>, "",
                      ]}
                      labelClassName="text-gray-800 font-semibold mb-1"
                    />
                  }
                />
                <Line type="monotone" dataKey="revenue" stroke="#0099ff" strokeWidth={2}
                  dot={<Dot r={4} fill="#0f1117" stroke="#0099ff" strokeWidth={2} />}
                  activeDot={{ r: 6, fill: "#0099ff", stroke: "#0f1117", strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="bg-[#13151e] border-white/5 w-full md:w-[300px] flex-shrink-0">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-white text-base font-semibold">Daily Transaction</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ChartContainer config={dailyChartConfig} className="h-[220px] w-full">
              <BarChart data={dailyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barSize={32}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} ticks={[0, 200, 500, 1000, 1500, 2000]} />
                <ChartTooltip content={<ChartTooltipContent className="bg-[#1e2130] border border-white/10 text-white rounded-xl" />} />
                <Bar dataKey="txns" radius={[4, 4, 0, 0]}>
                  {dailyData.map((_, i) => <Cell key={i} fill="#00aaff" fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-0 flex-row items-center justify-between">
          <CardTitle className="text-white text-base font-semibold">Recent Transactions</CardTitle>
          <div className="relative w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 z-10 pointer-events-none" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="bg-[#1a1d27] border-white/10 text-white/50 pl-9 h-9 text-sm focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d27] border-white/10 text-white">
                <SelectItem value="withdraw">Withdraw</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5">Transaction</TableHead>
                <TableHead className="text-white/35 font-medium">Type</TableHead>
                <TableHead className="text-white/35 font-medium">Amount</TableHead>
                <TableHead className="text-white/35 font-medium">Status</TableHead>
                <TableHead className="text-white/35 font-medium">Date</TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="text-white font-medium px-5 py-4">{tx.id}</TableCell>
                  <TableCell className="text-white/70">{tx.type}</TableCell>
                  <TableCell className="text-white/70">{tx.amount}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      tx.status === "Completed"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-400/5"
                        : "border-amber-500/40 text-amber-400 bg-amber-400/5"
                    }`}>
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/50 text-sm">{tx.date}</TableCell>
                  <TableCell className="text-right pr-5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-white/40 hover:text-white hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1d27] border-white/10 text-white min-w-[130px]">
                        <DropdownMenuItem className="gap-2 text-emerald-400 focus:text-emerald-400 focus:bg-emerald-400/10 cursor-pointer">
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                          <XCircle className="w-4 h-4" /> Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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