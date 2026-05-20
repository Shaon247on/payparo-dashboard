"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import type { UserRegistrationChartData } from "@/types/overview.type";

interface UserRegistrationChartProps {
  chartData?: UserRegistrationChartData[];
}

const chartConfig = {
  users: {
    label: "Registrations",
    color: "#00aaff",
  },
} satisfies ChartConfig;

export function UserRegistrationChart({ chartData }: UserRegistrationChartProps) {
  const data = chartData
    ? chartData.map((d) => ({
        month: d.month,
        users: d.registrations,
      }))
    : [
        { month: "Jan", users: 0 },
        { month: "Feb", users: 0 },
        { month: "Mar", users: 0 },
        { month: "Apr", users: 0 },
        { month: "May", users: 0 },
      ];

  return (
    <Card className="bg-[#13151e] border-white/5 w-full shrink-0">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-white text-base font-semibold">
          User Registrations
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <BarChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            barSize={36}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-[#1e2130] border border-white/10 text-white rounded-xl"
                />
              }
            />
            <Bar dataKey="users" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill="#00aaff" fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}