"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { syncSessionAction } from "@/actions/auth.action";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarNav } from "./SidebarNav";
import { AffiliateSidebarNav } from "./AffiliateSidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const protectedRoutes = ["/dashboard", "/kyc", "/affiliate"];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAffiliateRoute = pathname.startsWith("/affiliate");

  // Synchronize session cookie if needed when entering protected routes
  useEffect(() => {
    if (isProtectedRoute) {
      syncSessionAction().catch((err) => {
        console.error("Failed to sync session cookie in background:", err);
      });
    }
  }, [isProtectedRoute, pathname]);

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Sidebar */}
      {isProtectedRoute && (
        <aside className="hidden lg:flex md:w-55 lg:w-60 shrink-0">
          {isAffiliateRoute ? <AffiliateSidebarNav /> : <SidebarNav />}
        </aside>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        {isProtectedRoute && <DashboardHeader />}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}