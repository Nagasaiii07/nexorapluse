"use client";

import React from "react";
import { OrderStatusOverview } from "@/types";

interface DonutProps {
  data: OrderStatusOverview;
}

export default function OrderStatusDonut({ data }: DonutProps) {
  const total = data?.total_orders || 8426;
  const items = data?.items || [
    { name: "Delivered", count: 7621, percentage: 90.4, color: "#16a34a", colorClass: "bg-emerald-500" },
    { name: "Shipped", count: 171, percentage: 2.0, color: "#2563eb", colorClass: "bg-blue-600" },
    { name: "Processing", count: 124, percentage: 1.5, color: "#ea580c", colorClass: "bg-amber-500" },
    { name: "Cancelled", count: 327, percentage: 3.9, color: "#dc2626", colorClass: "bg-rose-500" },
    { name: "Returned", count: 248, percentage: 2.9, color: "#8b5cf6", colorClass: "bg-purple-500" },
  ];

  // SVG Donut geometry
  const size = 170;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between">
      {/* Card Title */}
      <h3 className="font-semibold text-slate-900 text-sm pb-2 border-b border-slate-100">
        Order Status Overview
      </h3>

      {/* Main Body: Donut + Legend Table */}
      <div className="flex items-center justify-between gap-4 py-2 mt-1">
        {/* Donut Chart with Center Text */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {items.map((item) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += item.percentage;

              return (
                <circle
                  key={item.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900 leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">
              Total Orders
            </span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="flex-1 space-y-2">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-slate-800">{item.count.toLocaleString()}</span>
                <span className="text-slate-400 w-10 text-right font-normal">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
