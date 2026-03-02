import { StatsCards } from "@/components/elements/StatsCards";
import { EscrowLineChart } from "@/components/elements/EscrowLineChart";
import { RealTimeActivity } from "@/components/elements/RealTimeActivity";
import { UserRegistrationChart } from "@/components/elements/UserRegistrationChart ";

export default function DashboardPage() {
  return (
    <div className="space-y-4 md:space-y-5">
      {/* Stats Row */}
      <StatsCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">
        <div className="col-span-1 lg:col-span-3">
          <EscrowLineChart />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <UserRegistrationChart />
        </div>
      </div>

      {/* Activity Feed */}
      <RealTimeActivity />
    </div>
  );
}
