"use client";

import React, { useState } from "react";
import { BarChart3 } from "lucide-react";
import { RevenueProfitPoint } from "@/types";

interface ChartProps {
  data: RevenueProfitPoint[];
  onIntervalChange?: (interval: string) => void;
}

export default function RevenueProfitChart({ data, onIntervalChange }: ChartProps) {
  const [activeInterval, setActiveInterval] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const intervals: Array<"Daily" | "Weekly" | "Monthly"> = ["Daily", "Weekly", "Monthly"];

  const handleIntervalClick = (interval: "Daily" | "Weekly" | "Monthly") => {
    setActiveInterval(interval);
    if (onIntervalChange) onIntervalChange(interval);
  };

  const points = data && data.length > 0 ? data : [
    { date: "Apr 23", revenue: 11.2, profit: 2.4, revFormatted: "₹11.2L", profitFormatted: "₹2.4L" },
    { date: "Apr 26", revenue: 9.8, profit: 2.1, revFormatted: "₹9.8L", profitFormatted: "₹2.1L" },
    { date: "Apr 29", revenue: 13.6, profit: 2.9, revFormatted: "₹13.6L", profitFormatted: "₹2.9L" },
    { date: "May 02", revenue: 12.4, profit: 2.65, revFormatted: "₹12.4L", profitFormatted: "₹2.65L" },
    { date: "May 05", revenue: 14.2, profit: 3.05, revFormatted: "₹14.2L", profitFormatted: "₹3.05L" },
    { date: "May 08", revenue: 14.8, profit: 3.2, revFormatted: "₹14.8L", profitFormatted: "₹3.2L" }
  ];

  // SVG Chart Geometry
  const chartW = 600;
  const chartH = 180;
  const paddingL = 40;
  const paddingR = 60;
  const paddingT = 20;
  const paddingB = 30;

  const innerW = chartW - paddingL - paddingR;
  const innerH = chartH - paddingT - paddingB;

  const maxY = 20.0;
  const yTicks = [20, 15, 10, 5, 0];

  const getX = (i: number) => paddingL + (i / (points.length - 1)) * innerW;
  const getY = (val: number) => paddingT + innerH - (val / maxY) * innerH;

  // Build smooth bezier curves
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx.toFixed(1)} ${p0.y.toFixed(1)}, ${cx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return path;
  };

  const revPts = points.map((p, i) => ({ x: getX(i), y: getY(p.revenue) }));
  const profitPts = points.map((p, i) => ({ x: getX(i), y: getY(p.profit) }));

  const revPath = buildSmoothPath(revPts);
  const profitPath = buildSmoothPath(profitPts);

  const bottomY = getY(0);
  const revAreaPath = `${revPath} L ${revPts[revPts.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${revPts[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  const profitAreaPath = `${profitPath} L ${profitPts[profitPts.length - 1].x.toFixed(1)} ${bottomY.toFixed(1)} L ${profitPts[0].x.toFixed(1)} ${bottomY.toFixed(1)} Z`;

  const lastRev = points[points.length - 1];
  const lastRevPt = revPts[revPts.length - 1];
  const lastProfitPt = profitPts[profitPts.length - 1];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between">
      {/* Chart Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">
            Revenue & Profit Trend
          </h3>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Profit</span>
          </div>
        </div>

        {/* Interval Toggle Pills */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
          {intervals.map((intv) => (
            <button
              key={intv}
              onClick={() => handleIntervalClick(intv)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeInterval === intv
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {intv}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full mt-3 flex-1 min-h-[175px]">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingL}
                  y1={y}
                  x2={chartW - paddingR}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingL - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  {val}L
                </text>
              </g>
            );
          })}

          {/* Area Gradients */}
          <path d={revAreaPath} fill="url(#revenueGrad)" />
          <path d={profitAreaPath} fill="url(#profitGrad)" />

          {/* Revenue Line */}
          <path
            d={revPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Profit Line */}
          <path
            d={profitPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points and Hover Target */}
          {points.map((p, i) => {
            const rx = getX(i);
            const ry = getY(p.revenue);
            const py = getY(p.profit);
            const isHover = hoveredIdx === i;

            return (
              <g key={p.date} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                {/* Vertical guideline on hover */}
                {isHover && (
                  <line
                    x1={rx}
                    y1={paddingT}
                    x2={rx}
                    y2={bottomY}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* X-Axis Date Label */}
                <text
                  x={rx}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill={isHover ? "#1e293b" : "#94a3b8"}
                  fontWeight={isHover ? "600" : "400"}
                  fontSize="10"
                >
                  {p.date}
                </text>

                {/* Blue Revenue Dot */}
                <circle
                  cx={rx}
                  cy={ry}
                  r={isHover ? "5" : "3.5"}
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2"
                />

                {/* Green Profit Dot */}
                <circle
                  cx={rx}
                  cy={py}
                  r={isHover ? "5" : "3.5"}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Right Callout Badges (Exact values from reference image) */}
          <g transform={`translate(${lastRevPt.x + 8}, ${lastRevPt.y - 10})`}>
            <rect width="46" height="20" rx="4" fill="#2563eb" />
            <text x="23" y="14" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              {lastRev?.revFormatted || "₹14.8L"}
            </text>
          </g>

          <g transform={`translate(${lastProfitPt.x + 8}, ${lastProfitPt.y - 10})`}>
            <rect width="44" height="20" rx="4" fill="#10b981" />
            <text x="22" y="14" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              {lastRev?.profitFormatted || "₹3.2L"}
            </text>
          </g>
        </svg>

        {/* Floating Tooltip when Hovered */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] pointer-events-none z-20 border border-slate-700"
            style={{
              left: `${(hoveredIdx / (points.length - 1)) * 75 + 10}%`,
              top: "10%"
            }}
          >
            <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1">
              {points[hoveredIdx].date}
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Revenue: {points[hoveredIdx].revFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Profit: {points[hoveredIdx].profitFormatted}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
