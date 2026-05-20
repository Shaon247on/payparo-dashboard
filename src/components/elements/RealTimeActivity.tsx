"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ShieldAlert, UserPlus, Wallet } from "lucide-react";
import type { ActivityFeedItem } from "@/types/overview.type";

interface RealTimeActivityProps {
  activityData?: ActivityFeedItem[];
}

export function RealTimeActivity({ activityData }: RealTimeActivityProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (isoString: string) => {
    if (!mounted) return "...";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "signup":
        return <UserPlus className="w-4 h-4 text-sky-400" />;
      case "escrow":
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "dispute":
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-white/50" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "signup":
        return "bg-sky-400/10";
      case "escrow":
        return "bg-emerald-400/10";
      case "dispute":
        return "bg-rose-400/10";
      default:
        return "bg-white/10";
    }
  };

  const list = activityData ?? [];

  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-white text-base font-semibold">
          Platform Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {list.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">No platform activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between py-4 gap-4 group hover:bg-white/[0.01] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-1.5 rounded-md mt-0.5 shrink-0 ${getBg(activity.type)}`}>
                    {getIcon(activity.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {activity.title}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-white/35 shrink-0 mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px] whitespace-nowrap">{formatTime(activity.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}