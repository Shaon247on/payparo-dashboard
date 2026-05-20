import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Wallet, AlertTriangle } from "lucide-react";
import type { OverviewStats } from "@/types/overview.type";

interface StatsCardsProps {
  data?: OverviewStats;
}

export function StatsCards({ data }: StatsCardsProps) {
  const statsList = [
    {
      label: "Total Users",
      value: data ? data.total_users.toLocaleString() : "0",
      icon: Users,
      iconColor: "text-white/70",
      iconBg: "bg-white/10",
    },
    {
      label: "Pending KYC",
      value: data ? data.pending_kyc.toLocaleString() : "0",
      icon: UserCheck,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-400/10",
    },
    {
      label: "Active Escrow",
      value: data ? `$${data.active_escrow_volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : "$0.00 USD",
      icon: Wallet,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
    },
    {
      label: "Open Disputes",
      value: data ? data.open_disputes.toLocaleString() : "0",
      icon: AlertTriangle,
      iconColor: "text-red-400",
      iconBg: "bg-red-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statsList.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
        <Card
          key={label}
          className="bg-[#13151e] border-white/5 hover:border-white/10 transition-colors"
        >
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`p-1.5 rounded-md ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <span className="text-white/50 text-sm font-medium">{label}</span>
            </div>
            <p className="text-white font-bold text-xl md:text-2xl tracking-tight">
              {value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}