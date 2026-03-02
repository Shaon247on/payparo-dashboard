import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total Transactions", value: "7", icon: BarChart2, iconColor: "text-emerald-400", iconBg: "bg-emerald-400/10" },
  { label: "Active Transactions", value: "3", icon: BarChart2, iconColor: "text-emerald-400", iconBg: "bg-emerald-400/10" },
  { label: "In dispute", value: "1", icon: AlertTriangle, iconColor: "text-red-400", iconBg: "bg-red-400/10" },
  { label: "Completed", value: "1", icon: CheckCircle2, iconColor: "text-emerald-400", iconBg: "bg-emerald-400/10" },
];

const transactions = [
  { id: "Tx001", seller: "Michel Smith", buyer: "Smith Sara", item: "Sony A7 IV camera", amount: "$1250" },
  { id: "Tx002", seller: "Smith Sara", buyer: "Michel smith", item: "Iphone 15 pro max", amount: "$1863" },
  { id: "Tx003", seller: "Sarah Michel", buyer: "David Kim", item: "Audi Car", amount: "$5698" },
  { id: "Tx004", seller: "David Kim", buyer: "Sarah John", item: "Gaming Pc", amount: "$8963" },
  { id: "Tx005", seller: "Sarah John", buyer: "Smith Sara", item: "Macbook pro", amount: "$5897" },
  { id: "Tx006", seller: "John David", buyer: "Michel Smith", item: "BMW car", amount: "$9687" },
];

export default function EscrowTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold">Escrow Transactions</h2>
        <p className="text-white/40 text-sm mt-1">
          Monitor and manage all escrow transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-1.5 rounded-md ${iconBg}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <span className="text-white/50 text-sm font-medium">{label}</span>
              </div>
              <p className="text-white font-bold text-2xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle className="text-white text-base font-semibold">
            Users ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5">Transaction</TableHead>
                <TableHead className="text-white/35 font-medium">Seller</TableHead>
                <TableHead className="text-white/35 font-medium">Buyer</TableHead>
                <TableHead className="text-white/35 font-medium">Items</TableHead>
                <TableHead className="text-white/35 font-medium">Escrow amount</TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="text-white font-medium px-5 py-4">{tx.id}</TableCell>
                  <TableCell className="text-white/70">{tx.seller}</TableCell>
                  <TableCell className="text-white/70">{tx.buyer}</TableCell>
                  <TableCell className="text-white/70">{tx.item}</TableCell>
                  <TableCell className="text-white/70">{tx.amount}</TableCell>
                  <TableCell className="text-right pr-5">
                    <Link href={`/dashboard/escrow/${tx.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-md"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
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