"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Dot,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyRevenue } from "@/types/revenue.type";

interface Props {
  data: MonthlyRevenue[];
}

const chartConfig = {
  revenue: { label: "Platform Fee Revenue (USD)", color: "#0091e5" },
} satisfies ChartConfig;

export default function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center">
        <p className="text-white/30 text-sm">No revenue data for the past 12 months.</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => (v === 0 ? "$0" : `$${(v / 1000).toFixed(1)}k`)}
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="bg-[#1a1d27] border border-white/10 text-white rounded-xl"
              formatter={(value) => [
                <span key="v" className="text-[#0091e5] font-semibold">
                  ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>,
                "Revenue",
              ]}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#0091e5"
          strokeWidth={2}
          dot={<Dot r={4} fill="#0f1117" stroke="#0091e5" strokeWidth={2} />}
          activeDot={{ r: 6, fill: "#0091e5", stroke: "#0f1117", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
