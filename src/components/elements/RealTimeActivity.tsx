import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    name: "Sarah Jonson",
    action: "KYC Documents Approved",
    time: "5 Minutes ago",
  },
  {
    id: 2,
    name: "David Kim",
    action: "KYC Documents Approved",
    time: "5 Minutes ago",
  },
  {
    id: 3,
    name: "Escrow Created",
    action: "Delivered",
    time: "5 Minutes ago",
  },
  {
    id: 4,
    name: "Mohammed Al-Hassan",
    action: "New Dispute Raised",
    time: "12 Minutes ago",
  },
  {
    id: 5,
    name: "Priya Sharma",
    action: "KYC Documents Pending Review",
    time: "18 Minutes ago",
  },
  {
    id: 6,
    name: "James Carter",
    action: "Escrow Payment Released",
    time: "25 Minutes ago",
  },
];

export function RealTimeActivity() {
  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardHeader className="px-5 pt-5 pb-3">
        <CardTitle className="text-white text-base font-semibold">
          Real Time Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="divide-y divide-white/5">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between py-4 gap-4 group hover:bg-white/2 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {activity.name}
                </p>
                <p className="text-white/40 text-sm mt-0.5 truncate">
                  {activity.action}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-white/35 shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs whitespace-nowrap">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}