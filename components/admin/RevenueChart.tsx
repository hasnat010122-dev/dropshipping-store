"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartPoint = { label: string; revenue: number; orders: number };

export default function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4B5C" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FF4B5C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="rgba(255,255,255,0.35)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.35)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#16161F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
            color: "#E8E8ED",
          }}
          labelStyle={{ color: "#E8E8ED" }}
          formatter={(value, name) => [
            name === "revenue" ? `Rs ${Number(value).toLocaleString()}` : String(value),
            name === "revenue" ? "Revenue" : "Orders",
          ]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#FF4B5C"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
