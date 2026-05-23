import { Suspense } from "react";
import { getMarketingBannersAction } from "@/actions/marketing.action";
import { AlertCircle, Megaphone } from "lucide-react";
import MarketingClientPage from "@/app/dashboard/marketing/MarketingClientPage";

export default async function Page() {
  const result = await getMarketingBannersAction();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#0091e5]/10">
              <Megaphone className="w-4 h-4 text-[#0091e5]" />
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight">Marketing</h2>
          </div>
          <p className="text-white/40 text-sm mt-1 ml-0.5">
            Manage banner images and redirect links displayed on the mobile app home screen
          </p>
        </div>
      </div>

      {/* Main client-side container */}
      {!result.success ? (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      ) : (
        <MarketingClientPage initialBanners={result.data || []} />
      )}
    </div>
  );
}
