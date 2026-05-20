import { AlertCircle, TrendingUp, DollarSign, CheckCircle, Activity, RotateCcw, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRevenueStatsAction } from "@/actions/revenue.action";
import RevenueChart from "@/components/dashboard/superAdmin/RevenueChart";

function fmt(value: string | number, currency = "USD") {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

export default async function RevenuePage() {
  const result = await getRevenueStatsAction();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Revenue</h2>
          <p className="text-white/40 text-sm mt-1">Platform earnings and escrow analytics</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      </div>
    );
  }

  const stats = result.data;

  const statCards = [
    {
      label: "Today's Revenue",
      value: fmt(stats.today_revenue),
      icon: TrendingUp,
      color: "text-[#0091e5]",
      bg: "bg-[#0091e5]/10",
    },
    {
      label: "This Week",
      value: fmt(stats.this_week_revenue),
      icon: BarChart2,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      label: "This Month",
      value: fmt(stats.this_month_revenue),
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      label: "Total Revenue",
      value: fmt(stats.total_revenue),
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  const countCards = [
    {
      label: "Completed Escrows",
      value: stats.total_completed_escrows.toLocaleString(),
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Active Escrows",
      value: stats.total_active_escrows.toLocaleString(),
      icon: Activity,
      color: "text-[#0091e5]",
      bg: "bg-[#0091e5]/10",
    },
    {
      label: "Total Volume",
      value: fmt(stats.total_escrow_volume),
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      label: "Refunded",
      value: stats.total_refunded_escrows.toLocaleString(),
      icon: RotateCcw,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Revenue</h2>
        <p className="text-white/40 text-sm mt-1">
          Platform fee earnings derived from completed escrow transactions
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-1.5 rounded-md ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-white/50 text-sm font-medium">{label}</span>
              </div>
              <p className={`font-bold text-xl ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Escrow Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {countCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="bg-[#13151e] border-white/5">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`p-1.5 rounded-md ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-white/50 text-sm font-medium">{label}</span>
              </div>
              <p className="text-white font-bold text-xl">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base font-semibold">
              Monthly Platform Revenue
            </CardTitle>
            <span className="text-white/30 text-xs">Past 12 months • Escrow fees only</span>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <RevenueChart data={stats.monthly_revenue} />
        </CardContent>
      </Card>

      {/* Recent Completed Escrows */}
      <Card className="bg-[#13151e] border-white/5">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle className="text-white text-base font-semibold">
            Recent Completed Escrows
          </CardTitle>
          <p className="text-white/40 text-xs mt-1">
            Latest 10 transactions that generated platform fee revenue
          </p>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {stats.recent_escrows.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No completed escrows yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Order</th>
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Item</th>
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Seller</th>
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Buyer</th>
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Volume</th>
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Fee Earned</th>
                    <th className="text-left px-5 py-3.5 text-white/40 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_escrows.map((escrow) => (
                    <tr
                      key={escrow.order_id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-white/70 font-mono text-xs bg-white/5 px-2 py-0.5 rounded">
                          {escrow.order_id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium max-w-[160px] truncate">
                          {escrow.product_name}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-white/60">{escrow.seller}</td>
                      <td className="px-5 py-3.5 text-white/60">{escrow.buyer}</td>
                      <td className="px-5 py-3.5 text-white/70">
                        {fmt(escrow.total_amount, escrow.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 font-semibold">
                          +{fmt(escrow.fee_amount, escrow.currency)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-white/40 text-xs">
                        {new Date(escrow.completed_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}