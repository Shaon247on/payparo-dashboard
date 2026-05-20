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
import { BarChart2, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import type { PaginatedEscrowResponse } from "@/types/escrow.type";

const PAGE_SIZE = 10;

interface EscrowTransactionsPageProps {
  data: PaginatedEscrowResponse;
}

export default function EscrowTransactionsPage({
  data,
}: EscrowTransactionsPageProps) {
  const { results, count, stats } = data;

  const statCards = [
    {
      label: "Total Transactions",
      value: stats.total_transactions,
      icon: BarChart2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
    },
    {
      label: "Active Transactions",
      value: stats.active_transactions,
      icon: BarChart2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
    },
    {
      label: "In Dispute",
      value: stats.in_dispute,
      icon: AlertTriangle,
      iconColor: "text-red-400",
      iconBg: "bg-red-400/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
    },
  ];

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
        {statCards.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
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
            Transactions ({count})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-white/35 font-medium px-5">
                  Transaction
                </TableHead>
                <TableHead className="text-white/35 font-medium">Seller</TableHead>
                <TableHead className="text-white/35 font-medium">Buyer</TableHead>
                <TableHead className="text-white/35 font-medium">Items</TableHead>
                <TableHead className="text-white/35 font-medium">
                  Escrow Amount
                </TableHead>
                <TableHead className="text-white/35 font-medium text-right pr-5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="text-center text-white/30 py-16 text-sm"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <TableCell className="text-white font-medium px-5 py-4 font-mono text-sm">
                      {tx.transaction}
                    </TableCell>
                    <TableCell className="text-white/70">{tx.seller}</TableCell>
                    <TableCell className="text-white/70">{tx.buyer}</TableCell>
                    <TableCell className="text-white/70">{tx.items}</TableCell>
                    <TableCell className="text-white/70">
                      ${tx.escrow_amount}
                    </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>

          <Pagination totalCount={count} pageSize={PAGE_SIZE} paramKey="page" />
        </CardContent>
      </Card>
    </div>
  );
}