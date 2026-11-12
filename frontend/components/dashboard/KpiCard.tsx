"use client";

import React from "react";
import {
  ShoppingCart,
  ClipboardList,
  CheckCircle2,
  Cog,
  Truck,
  XCircle,
  RotateCcw,
  IndianRupee,
  Wallet,
  Target,
  BarChart2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { KpiMetric } from "@/types";

interface KpiCardProps {
  metric: KpiMetric;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Total Purchases": ShoppingCart,
  "Total Orders": ClipboardList,
  "Accepted Orders": CheckCircle2,
  "Processing Orders": Cog,
  "Shipped Orders": Truck,
  "Delivered Orders": CheckCircle2,
  "Cancelled Orders": XCircle,
  "Returned Orders": RotateCcw,
  "Total Revenue": IndianRupee,
  "Total Profit": Wallet,
  "Delivery Success Rate": Target,
  "Average Order Value": BarChart2,
};

const colorStyles: Record<string, { bg: string; text: string; stroke: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", stroke: "#2563eb" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", stroke: "#16a34a" },
  orange: { bg: "bg-amber-50", text: "text-amber-600", stroke: "#ea580c" },
  red: { bg: "bg-rose-50", text: "text-rose-600", stroke: "#dc2626" },
  navy: { bg: "bg-slate-100", text: "text-slate-600", stroke: "#475569" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", stroke: "#0891b2" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", stroke: "#7c3aed" },
};

export default function KpiCard({ metric }: KpiCardProps) {
  const Icon = iconMap[metric.title] || ShoppingCart;
  const style = colorStyles[metric.color] || colorStyles.blue;
  const isUp = metric.trend === "up";

  // Build SVG path from sparkline points
  const points = metric.sparkline && metric.sparkline.length > 0 ? metric.sparkline : [10, 20, 15, 25, 22, 30, 28];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const pathD = points
    .map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
      {/* Top Header: Icon + Title */}
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500 leading-tight">
          {metric.title}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {metric.value}
        </span>
      </div>

      {/* Bottom Footer: Trend + Sparkline */}
      <div className="flex items-center justify-between pt-1">
        <div className={`flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{metric.change}</span>
        </div>

        {/* Mini Sparkline Curve */}
        <div className="w-20 h-7">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <path
              d={pathD}
              fill="none"
              stroke={style.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
