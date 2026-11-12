"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import RevenueProfitChart from "@/components/dashboard/RevenueProfitChart";
import { fetchOverview } from "@/services/api";
import { OverviewData } from "@/types";
import { IndianRupee, Wallet, TrendingUp, Percent, DollarSign, Layers } from "lucide-react";

export default function RevenuePage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchOverview({ platform, dateRange, search: searchQuery });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [platform, dateRange]);

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
            Revenue & Profit Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Financial unit economics, marketplace commission fees, and shipping margin profitability
          </p>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Total Revenue (GMV)</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{data?.kpis.total_revenue.value || "₹14.8L"}</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↑ 16.7% vs last month</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Net Realized Profit</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{data?.kpis.total_profit.value || "₹3.2L"}</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↑ 18.9% vs last month</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Blended Profit Margin</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">21.6%</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↑ 1.2% margin expansion</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Avg Fulfillment Cost / Order</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">₹142</span>
              <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">↓ ₹8 vs benchmark</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Central Trend Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-2 shadow-sm">
          <RevenueProfitChart data={data?.trend || []} />
        </div>

        {/* Financial Decomposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Marketplace Cost Structure</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Cost of Goods Sold (COGS)</span>
                  <span className="font-bold text-slate-900">54.2% (₹8.02L)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "54.2%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Net Realized Profit</span>
                  <span className="font-bold text-slate-900">21.6% (₹3.20L)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "21.6%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Platform Referral & Closing Fees</span>
                  <span className="font-bold text-slate-900">14.8% (₹2.19L)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "14.8%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600">Last-Mile Logistics & Shipping</span>
                  <span className="font-bold text-slate-900">9.4% (₹1.39L)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: "9.4%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Marketplace Profit Contribution</h3>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <span className="font-bold text-amber-900 block text-sm">Amazon India</span>
                <span className="text-2xl font-black text-amber-950 mt-1 block">₹1.82L</span>
                <span className="text-[11px] text-amber-700 block mt-1">22.8% Margin • 4,535 Orders</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <span className="font-bold text-blue-900 block text-sm">Flipkart</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">₹1.38L</span>
                <span className="text-[11px] text-blue-700 block mt-1">20.2% Margin • 3,891 Orders</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
