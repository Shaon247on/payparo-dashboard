"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import type { EscrowChartData } from "@/types/overview.type";

interface EscrowLineChartProps {
  chartData?: EscrowChartData[];
}

const chartConfig = {
  escrow: {
    label: "Escrow",
    color: "#0099ff",
  },
} satisfies ChartConfig;

const formatYAxis = (value: number) => {
  if (value === 0) return "$0";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

export function EscrowLineChart({ chartData }: EscrowLineChartProps) {
  const data = chartData
    ? chartData.map((d) => ({
        month: d.month.substring(0, 3),
        escrow: d.volume,
      }))
    : [
        { month: "Jan", escrow: 0 },
        { month: "Feb", escrow: 0 },
        { month: "Mar", escrow: 0 },
        { month: "Apr", escrow: 0 },
        { month: "May", escrow: 0 },
        { month: "Jun", escrow: 0 },
      ];

  return (
    <Card className="bg-[#13151e] border-white/5 flex-1">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-white text-base font-semibold">
          Total Escrow Volume
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <LineChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={true}
              horizontal={false}
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
              tickFormatter={formatYAxis}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-white text-gray-900 border-0 shadow-xl rounded-xl px-3 py-2"
                  formatter={(value) => [
                    <span key="val" className="text-[#0099ff] font-semibold">
                      Volume : ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>,
                    "",
                  ]}
                  labelClassName="text-gray-800 font-semibold mb-1"
                />
              }
            />
            <Line
              type="monotone"
              dataKey="escrow"
              stroke="#0099ff"
              strokeWidth={2}
              dot={<Dot r={4} fill="#0f1117" stroke="#0099ff" strokeWidth={2} />}
              activeDot={{ r: 6, fill: "#0099ff", stroke: "#0f1117", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}