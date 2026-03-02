"use client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileSidebar } from "./MobileSidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const pathname = usePathname();
  const isKyc = pathname.startsWith("/kyc");
  const roleLabel = isKyc
    ? "KYC Specialist Dashboard"
    : "Super Admin Dashboard";
  const route = isKyc
    ? "/kyc/profile"
    : "/dashboard/profile";
  return (
    <header className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 border-b border-white/5 bg-[#0f1117] shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <MobileSidebar />
        <h1 className="text-white font-bold text-lg md:text-xl lg:text-2xl tracking-tight">
          {roleLabel}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link href={route}>
          <Avatar className="w-9 h-9 ring-2 ring-[#00d4aa]/30">
            <AvatarImage src="/avatar.jpg" alt="Admin" />
            <AvatarFallback className="bg-[#1e2130] text-white/70 text-xs">
              SA
            </AvatarFallback>
          </Avatar>
        </Link>
        <Link href={"/login"}>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Logout</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
