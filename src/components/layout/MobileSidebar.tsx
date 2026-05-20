"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";
import { AffiliateSidebarNav } from "./AffiliateSidebarNav";
import { usePathname } from "next/navigation";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAffiliateRoute = pathname.startsWith("/affiliate");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white/70 hover:text-white hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-60 bg-[#13151e] border-r border-white/5"
      >
        {isAffiliateRoute ? <AffiliateSidebarNav /> : <SidebarNav />}
      </SheetContent>
    </Sheet>
  );
}