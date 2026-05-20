"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.action";

const affiliateNavItems = [
  { label: "Overview", href: "/affiliate", icon: LayoutDashboard },
  { label: "Referral Link", href: "/affiliate/link", icon: Link2 },
  { label: "Rewards Ledger", href: "/affiliate/rewards", icon: DollarSign },
  { label: "Referred Users", href: "/affiliate/referrals", icon: Users },
  { label: "Withdrawals", href: "/affiliate/payouts", icon: TrendingUp },
  { label: "Tier Status", href: "/affiliate/tier", icon: ShieldCheck },
];

export function AffiliateSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#13151e] border-r border-white/5 w-full">
      {/* Brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-[#0091e5] flex items-center justify-center font-bold text-white text-sm">
          PP
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wide leading-none">PayParo</span>
          <span className="text-[#0091e5] text-[10px] font-semibold tracking-wider uppercase mt-1">
            Affiliate Portal
          </span>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {affiliateNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(`${item.href}/`) && item.href !== "/affiliate");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 border group",
                isActive
                  ? "bg-[#0091e5]/10 text-[#0091e5] border-[#0091e5]/10"
                  : "text-white/40 border-transparent hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-[#0091e5]" : "text-white/30 group-hover:text-white/60"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Log out */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => logoutAction()}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/5 w-full transition-all"
        >
          <LogOut className="w-4 h-4 text-rose-400/70" />
          Log Out
        </button>
      </div>
    </div>
  );
}
