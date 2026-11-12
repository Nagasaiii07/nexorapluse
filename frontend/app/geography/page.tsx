"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import IndiaMap from "@/components/dashboard/IndiaMap";
import { fetchOverview } from "@/services/api";
import { TopState } from "@/types";
import { Globe, MapPin, Truck, TrendingUp } from "lucide-react";

export default function GeographyPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [states, setStates] = useState<TopState[]>([]);
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchOverview({ platform, dateRange });
      setStates(res.top_states || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [platform, dateRange]);

  const activeStateData = states.find((s) => s.state === selectedState) || states[0] || {
    state: "Maharashtra",
    revenue: 210000,
    revenueFormatted: "₹2.1L",
    percentage: 14.2,
    orders_count: 1196
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#f8fafc]">
      <Header
        platform={platform}
        onPlatformChange={setPlatform}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Geographic Analytics — India Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Territorial demand density, pin-code logistics fulfillment hubs, and state-level delivery speed
          </p>
        </div>

        {/* State Spotlight Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Selected Territory</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">{activeStateData.state}</span>
              <span className="text-xs font-semibold text-slate-500 mt-0.5 block">{activeStateData.percentage}% of National GMV</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">State Revenue</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{activeStateData.revenueFormatted}</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">Rank #1 in India</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Orders Dispatched</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{activeStateData.orders_count.toLocaleString()}</span>
              <span className="text-xs font-semibold text-blue-600 mt-0.5 block">High Volume Hub</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Avg Delivery Time</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">1.8 Days</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">SLA 96.2% On-Time</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Map & State Rankings Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Interactive Map Card */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-semibold text-slate-900 text-sm mb-4 self-start">Interactive Choropleth</h3>
            <div className="w-full max-w-sm">
              <IndiaMap activeState={selectedState} onStateSelect={setSelectedState} />
            </div>
            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Click on any region on the map to filter state logistics data
            </p>
          </div>

          {/* Right State Table */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm overflow-hidden flex flex-col justify-between">
            <h3 className="font-semibold text-slate-900 text-sm pb-2 border-b border-slate-100">
              State-Level Fulfillment Matrix
            </h3>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-2.5 font-medium">State</th>
                    <th className="pb-2.5 font-medium">Revenue</th>
                    <th className="pb-2.5 font-medium">Share</th>
                    <th className="pb-2.5 font-medium">Orders</th>
                    <th className="pb-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {states.map((st) => (
                    <tr
                      key={st.state}
                      onClick={() => setSelectedState(st.state)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedState === st.state ? "bg-blue-50/70 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2.5 font-medium text-slate-900">{st.state}</td>
                      <td className="py-2.5 font-bold text-slate-900">{st.revenueFormatted}</td>
                      <td className="py-2.5 text-slate-600">{st.percentage}%</td>
                      <td className="py-2.5 text-slate-600">{st.orders_count.toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <button className="text-blue-600 hover:underline font-semibold text-[11px]">
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
