"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  ShieldAlert,
  TrendingUp,
  UserCog,
  ClipboardList,
  Diamond,
  Link2,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "User Management", href: "/dashboard/users", icon: Users },
  {
    label: "Escrow Transactions",
    href: "/dashboard/escrow",
    icon: ArrowLeftRight,
  },
  {
    label: "Manage Dispute",
    href: "/dashboard/disputes",
    icon: ShieldAlert,
  },
  {
    label: "KYC Approvals",
    href: "/dashboard/kyc-pending",
    icon: UserCheck,
  },
  { label: "Revenue", href: "/dashboard/revenue", icon: TrendingUp },
  { label: "Affiliates", href: "/dashboard/affiliates", icon: Link2 },
  {
    label: "Withdraw Requests",
    href: "/dashboard/withdrawals",
    icon: DollarSign,
  },
  { label: "Admin", href: "/dashboard/admin", icon: UserCog },
];

const kycNavItems = [
  { label: "All Dispute", href: "/kyc", icon: ClipboardList },
  { label: "My Dispute", href: "/kyc/my-disputes", icon: Diamond },
];

export function SidebarNav() {
  const pathname = usePathname();
  const isKyc = pathname.startsWith("/kyc");
  const navItems = isKyc ? kycNavItems : adminNavItems;
  return (
    <div className="flex flex-col w-full h-full bg-[#13151e] border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-[#0091e5] to-[#1f9a5b]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-white"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">
          Pay<span className="text-[#0091e5]">Paro</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (pathname.startsWith(`${href}/`) &&
              href !== "/dashboard" &&
              href !== "/kyc");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-[#0091e5]" : "text-white/40",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
