"use client";

import React, { useState } from "react";
import IndiaMap from "./IndiaMap";
import { TopState } from "@/types";

interface TopStatesProps {
  states: TopState[];
  onStateSelect?: (state: string) => void;
  selectedState?: string;
}

export default function TopStatesRevenue({ states, onStateSelect, selectedState }: TopStatesProps) {
  const topList = states && states.length > 0 ? states.slice(0, 5) : [
    { state: "Maharashtra", revenue: 210000, revenueFormatted: "₹2.1L", percentage: 14.2, orders_count: 1196 },
    { state: "Karnataka", revenue: 180000, revenueFormatted: "₹1.8L", percentage: 12.1, orders_count: 1019 },
    { state: "Tamil Nadu", revenue: 160000, revenueFormatted: "₹1.6L", percentage: 10.8, orders_count: 910 },
    { state: "Gujarat", revenue: 130000, revenueFormatted: "₹1.3L", percentage: 8.7, orders_count: 733 },
    { state: "Uttar Pradesh", revenue: 120000, revenueFormatted: "₹1.2L", percentage: 8.1, orders_count: 682 }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">
          Top States by Revenue
        </h3>
        {selectedState && (
          <button
            onClick={() => onStateSelect && onStateSelect("All States")}
            className="text-[11px] text-blue-600 font-medium hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Map + List Grid */}
      <div className="grid grid-cols-12 gap-3 items-center mt-2">
        {/* India Map Choropleth Visual */}
        <div className="col-span-5 flex items-center justify-center">
          <IndiaMap activeState={selectedState} onStateSelect={onStateSelect} />
        </div>

        {/* State Rankings List */}
        <div className="col-span-7 space-y-2.5">
          {topList.map((st) => {
            const isSelected = selectedState === st.state;

            return (
              <div
                key={st.state}
                onClick={() => onStateSelect && onStateSelect(st.state)}
                className={`cursor-pointer group p-1 rounded-md transition-colors ${
                  isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${isSelected ? "text-blue-700 font-semibold" : "text-slate-700 group-hover:text-blue-600"}`}>
                    {st.state}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{st.revenueFormatted}</span>
                    <span className="text-slate-400 text-[11px] w-9 text-right">{st.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected ? "bg-blue-600" : "bg-blue-500 group-hover:bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(100, (st.percentage / 15.0) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
