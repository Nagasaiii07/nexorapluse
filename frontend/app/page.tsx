"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import KpiCard from "@/components/dashboard/KpiCard";
import RevenueProfitChart from "@/components/dashboard/RevenueProfitChart";
import OrderStatusDonut from "@/components/dashboard/OrderStatusDonut";
import TopStatesRevenue from "@/components/dashboard/TopStatesRevenue";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import { fetchOverview } from "@/services/api";
import { OverviewData } from "@/types";

export default function OverviewPage() {
  const [platform, setPlatform] = useState("All Platforms");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchOverview({
        platform,
        dateRange,
        state: selectedState,
        search: searchQuery
      });
      setOverviewData(data);
    } catch (err) {
      console.error("Failed to fetch overview data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [platform, dateRange, selectedState, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpis = overviewData?.kpis;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#f8fafc]">
      {/* Top Header */}
      <Header
        platform={platform}
        onPlatformChange={setPlatform}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main Dashboard Canvas */}
      <main className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        {/* Page Title & Live Pill */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time business performance and logistics intelligence
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>Live • Data Updated: {overviewData?.data_updated || "04:32 PM"}</span>
          </div>
        </div>

        {/* KPI Row 1 (5 Cards) */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard metric={kpis.total_purchases} />
            <KpiCard metric={kpis.total_orders} />
            <KpiCard metric={kpis.accepted_orders} />
            <KpiCard metric={kpis.processing_orders} />
            <KpiCard metric={kpis.shipped_orders} />
          </div>
        )}

        {/* KPI Row 2 (5 Cards) */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard metric={kpis.delivered_orders} />
            <KpiCard metric={kpis.cancelled_orders} />
            <KpiCard metric={kpis.returned_orders} />
            <KpiCard metric={kpis.total_revenue} />
            <KpiCard metric={kpis.total_profit} />
          </div>
        )}

        {/* KPI Row 3: 2 Cards + Revenue & Profit Chart */}
        {kpis && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 2 Cards */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <KpiCard metric={kpis.delivery_success_rate} />
              <KpiCard metric={kpis.average_order_value} />
            </div>

            {/* Right Wide Chart */}
            <div className="lg:col-span-8">
              <RevenueProfitChart data={overviewData?.trend || []} />
            </div>
          </div>
        )}

        {/* Bottom Row (3 Equal Cards: Donut, Top States Map, Recent Orders) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <OrderStatusDonut data={overviewData?.status_overview!} />
          <TopStatesRevenue
            states={overviewData?.top_states || []}
            selectedState={selectedState}
            onStateSelect={setSelectedState}
          />
          <RecentOrdersTable orders={overviewData?.recent_orders || []} />
        </div>
      </main>
    </div>
  );
}
