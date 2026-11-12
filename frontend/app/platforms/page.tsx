"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { fetchPlatformComparison } from "@/services/api";
import { Layers, ShoppingCart, ShoppingBag, ArrowRight, ShieldCheck, Clock, RotateCcw } from "lucide-react";

export default function PlatformsPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchPlatformComparison(dateRange);
      setComparison(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const amz = comparison?.amazon || {
    name: "Amazon India",
    gmv: "₹8.0L",
    orders: "4,535",
    aov: "₹1,768",
    success_rate: "92.9%",
    return_rate: "2.8%",
    avg_fulfillment_days: "1.8 days",
    market_share_pct: 54.2
  };

  const flp = comparison?.flipkart || {
    name: "Flipkart",
    gmv: "₹6.8L",
    orders: "3,891",
    aov: "₹1,742",
    success_rate: "92.7%",
    return_rate: "3.1%",
    avg_fulfillment_days: "2.1 days",
    market_share_pct: 45.8
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
            Amazon vs Flipkart Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Head-to-head marketplace benchmark: volume, conversion rates, shipping SLAs and profitability
          </p>
        </div>

        {/* Head-to-Head Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Amazon Card */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-amber-500/20">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Amazon India</h3>
                  <span className="text-xs text-amber-600 font-semibold">Primary Revenue Driver</span>
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">{amz.gmv}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 bg-amber-50/50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Orders</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{amz.orders}</span>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Success Rate</span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 block">{amz.success_rate}</span>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Avg Lead Time</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{amz.avg_fulfillment_days}</span>
              </div>
            </div>
          </div>

          {/* Flipkart Card */}
          <div className="bg-white rounded-2xl border border-blue-200/80 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/20">
                  F
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Flipkart</h3>
                  <span className="text-xs text-blue-600 font-semibold">Fastest Growing Tier-2 Hub</span>
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">{flp.gmv}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Orders</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{flp.orders}</span>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Success Rate</span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 block">{flp.success_rate}</span>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg">
                <span className="text-slate-500 block text-[11px]">Avg Lead Time</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{flp.avg_fulfillment_days}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm pb-3 border-b border-slate-100">
            Marketplace Operational Comparison Matrix
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between font-medium">
              <span className="text-slate-500 w-1/3">National GMV Market Share</span>
              <span className="text-amber-700 font-bold w-1/3 text-center">{amz.market_share_pct}%</span>
              <span className="text-blue-700 font-bold w-1/3 text-right">{flp.market_share_pct}%</span>
            </div>

            <div className="py-3 flex items-center justify-between font-medium">
              <span className="text-slate-500 w-1/3">Average Order Value (AOV)</span>
              <span className="font-bold text-slate-900 w-1/3 text-center">{amz.aov}</span>
              <span className="font-bold text-slate-900 w-1/3 text-right">{flp.aov}</span>
            </div>

            <div className="py-3 flex items-center justify-between font-medium">
              <span className="text-slate-500 w-1/3">Customer Return Rate</span>
              <span className="text-emerald-600 font-bold w-1/3 text-center">{amz.return_rate}</span>
              <span className="text-emerald-600 font-bold w-1/3 text-right">{flp.return_rate}</span>
            </div>

            <div className="py-3 flex items-center justify-between font-medium">
              <span className="text-slate-500 w-1/3">Preferred 3PL Logistics Partner</span>
              <span className="text-slate-800 font-semibold w-1/3 text-center">Amazon Logistics / BlueDart</span>
              <span className="text-slate-800 font-semibold w-1/3 text-right">Ekart / Delhivery</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
