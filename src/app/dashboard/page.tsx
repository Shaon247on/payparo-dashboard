import { StatsCards } from "@/components/elements/StatsCards";
import { EscrowLineChart } from "@/components/elements/EscrowLineChart";
import { RealTimeActivity } from "@/components/elements/RealTimeActivity";
import { UserRegistrationChart } from "@/components/elements/UserRegistrationChart ";
import { getOverviewStatsAction } from "@/actions/overview.action";

export default async function DashboardPage() {
  const res = await getOverviewStatsAction();
  const overviewData = res.success ? res.data : undefined;

  return (
    <div className="space-y-4 md:space-y-5">
      {res.success === false && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
          Warning: Failed to retrieve dynamic platform telemetry. Rendering offline workspace. (Details: {res.error})
        </div>
      )}

      {/* Stats Row */}
      <StatsCards data={overviewData?.stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5">
        <div className="col-span-1 lg:col-span-3">
          <EscrowLineChart chartData={overviewData?.escrow_chart} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <UserRegistrationChart chartData={overviewData?.registration_chart} />
        </div>
      </div>

      {/* Activity Feed */}
      <RealTimeActivity activityData={overviewData?.activity_feed} />
    </div>
  );
}
